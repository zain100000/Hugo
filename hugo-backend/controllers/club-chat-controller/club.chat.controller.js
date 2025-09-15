const mongoose = require("mongoose");
const Club = require("../models/club-model/club.model");
const ClubChat = require("../models/club-chat-model/club.chat.model");

const CLUB_EVENTS = {
  JOIN_CLUB: "joinClub",
  LEAVE_CLUB: "leaveClub",
  CREATE_CLUB: "createClub",
  DELETE_CLUB: "deleteClub",
  GET_CLUB_INFO: "getClubInfo",
  GET_CLUB_MEMBERS: "getClubMembers",

  SEND_MESSAGE: "sendMessage",
  GET_MESSAGE_HISTORY: "getMessageHistory",
  DELETE_MESSAGE: "deleteMessage",
  REACT_TO_MESSAGE: "reactToMessage",
  MARK_AS_READ: "markAsRead",

  KICK_MEMBER: "kickMember",
  BAN_MEMBER: "banMember",
  MUTE_MEMBER: "muteMember",
  INVITE_USER: "inviteUser",
  UPDATE_CLUB_SETTINGS: "updateClubSettings",

  CLUB_JOINED: "clubJoined",
  CLUB_LEFT: "clubLeft",
  CLUB_CREATED: "clubCreated",
  CLUB_DELETED: "clubDeleted",
  CLUB_INFO: "clubInfo",
  CLUB_MEMBERS: "clubMembers",
  NEW_MESSAGE: "newMessage",
  MESSAGE_HISTORY: "messageHistory",
  MESSAGE_DELETED: "messageDeleted",
  MESSAGE_REACTION: "messageReaction",
  MEMBER_KICKED: "memberKicked",
  MEMBER_BANNED: "memberBanned",
  MEMBER_MUTED: "memberMuted",
  USER_INVITED: "userInvited",
  CLUB_SETTINGS_UPDATED: "clubSettingsUpdated",
  ERROR: "error",
};

const sendError = (socket, message, details = null) => {
  const errorResponse = {
    success: false,
    message: message,
    ...(details && { details: details }),
  };
  socket.emit(CLUB_EVENTS.ERROR, errorResponse);
  return errorResponse;
};

const sendSuccess = (socket, event, message, data = null) => {
  const successResponse = {
    success: true,
    message: message,
    ...(data && { data: data }),
  };
  socket.emit(event, successResponse);
  return successResponse;
};

exports.initializeClubSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User ${socket.user?.id} connected to club socket`);
    socket.joinedClubs = new Set();

    /**
     * @desc Join a club
     * @event joinClub
     * @access Authenticated Users
     */
    socket.on(CLUB_EVENTS.JOIN_CLUB, async (data) => {
      try {
        const { clubId } = data;
        const userId = socket.user.id;

        if (!mongoose.Types.ObjectId.isValid(clubId)) {
          return sendError(socket, "Invalid club ID");
        }

        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");
        if (!club.isMember(userId) && !club.isPublic) {
          return sendError(socket, "You are not a member of this private club");
        }
        if (club.isBanned(userId)) {
          return sendError(socket, "You are banned from this club");
        }

        socket.join(clubId);
        socket.joinedClubs.add(clubId);

        sendSuccess(
          socket,
          CLUB_EVENTS.CLUB_JOINED,
          "Joined club successfully",
          {
            clubId,
            clubName: club.name,
          }
        );

        socket.to(clubId).emit(CLUB_EVENTS.NEW_MEMBER, {
          userId,
          userName: socket.user.userName,
          joinedAt: new Date(),
        });
      } catch (error) {
        console.error("JOIN_CLUB error:", error);
        sendError(socket, "Failed to join club", error.message);
      }
    });

    /**
     * @desc Leave a club
     * @event leaveClub
     * @access Authenticated Users
     */
    socket.on(CLUB_EVENTS.LEAVE_CLUB, async (data) => {
      try {
        const { clubId } = data;
        if (socket.joinedClubs.has(clubId)) {
          socket.leave(clubId);
          socket.joinedClubs.delete(clubId);

          sendSuccess(socket, CLUB_EVENTS.CLUB_LEFT, "Left club successfully", {
            clubId,
          });
        }
      } catch (error) {
        console.error("LEAVE_CLUB error:", error);
        sendError(socket, "Failed to leave club", error.message);
      }
    });

    /**
     * @desc Send a message in a club
     * @event sendMessage
     * @access Club Members
     */
    socket.on(CLUB_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        const { clubId, text, type, replyTo } = data;
        const userId = socket.user.id;

        if (!socket.joinedClubs.has(clubId)) {
          return sendError(socket, "You are not in this club");
        }

        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const member = club.members.find((m) => m.user.toString() === userId);
        if (member && member.status === "MUTED") {
          return sendError(socket, "You are muted in this club");
        }

        const message = new ClubChat({
          club: clubId,
          sender: userId,
          text,
          type: type || "TEXT",
          replyTo,
        });

        await message.save();
        await message.populate("sender", "userName profilePicture");

        io.to(clubId).emit(CLUB_EVENTS.NEW_MESSAGE, {
          message: {
            _id: message._id,
            text: message.text,
            type: message.type,
            sender: message.sender,
            createdAt: message.createdAt,
            replyTo: message.replyTo,
          },
          clubId,
        });
      } catch (error) {
        console.error("SEND_MESSAGE error:", error);
        sendError(socket, "Failed to send message", error.message);
      }
    });

    /**
     * @desc Get chat history for a club
     * @event getMessageHistory
     * @access Club Members
     */
    socket.on(CLUB_EVENTS.GET_MESSAGE_HISTORY, async (data) => {
      try {
        const { clubId, limit = 50, skip = 0 } = data;

        if (!socket.joinedClubs.has(clubId)) {
          return sendError(socket, "You are not in this club");
        }

        const messages = await ClubChat.find({ club: clubId, isDeleted: false })
          .populate("sender", "userName profilePicture")
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip);

        sendSuccess(
          socket,
          CLUB_EVENTS.MESSAGE_HISTORY,
          "Message history retrieved",
          {
            messages: messages.reverse(),
            clubId,
          }
        );
      } catch (error) {
        console.error("GET_MESSAGE_HISTORY error:", error);
        sendError(socket, "Failed to get message history", error.message);
      }
    });

    /**
     * @desc Delete a club message
     * @event deleteMessage
     * @access Message Owner or Club Moderator/Admin
     */
    socket.on(CLUB_EVENTS.DELETE_MESSAGE, async (data) => {
      try {
        const { messageId, clubId } = data;
        const userId = socket.user.id;

        const message = await ClubChat.findById(messageId);
        if (!message) return sendError(socket, "Message not found");

        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const canDelete =
          message.sender.toString() === userId || club.isModerator(userId);
        if (!canDelete) {
          return sendError(
            socket,
            "You don't have permission to delete this message"
          );
        }

        message.isDeleted = true;
        message.deletedBy = userId;
        message.deletedAt = new Date();
        await message.save();

        io.to(clubId).emit(CLUB_EVENTS.MESSAGE_DELETED, {
          messageId,
          clubId,
          deletedBy: userId,
        });
      } catch (error) {
        console.error("DELETE_MESSAGE error:", error);
        sendError(socket, "Failed to delete message", error.message);
      }
    });

    /**
     * @desc Add or remove a reaction to a message
     * @event reactToMessage
     * @access Club Members
     */
    socket.on(CLUB_EVENTS.REACT_TO_MESSAGE, async (data) => {
      try {
        const { messageId, clubId, emoji } = data;
        const userId = socket.user.id;

        const message = await ClubChat.findById(messageId);
        if (!message) return sendError(socket, "Message not found");

        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.user.toString() === userId && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
          message.reactions.splice(existingReactionIndex, 1);
        } else {
          message.reactions.push({ user: userId, emoji });
        }

        await message.save();
        await message.populate("reactions.user", "userName");

        io.to(clubId).emit(CLUB_EVENTS.MESSAGE_REACTION, {
          messageId,
          clubId,
          reactions: message.reactions,
          reactedBy: userId,
        });
      } catch (error) {
        console.error("REACT_TO_MESSAGE error:", error);
        sendError(socket, "Failed to react to message", error.message);
      }
    });

    /**
     * @desc Kick a member from a club
     * @event kickMember
     * @access Admins & Moderators
     */
    socket.on(CLUB_EVENTS.KICK_MEMBER, async (data) => {
      try {
        const { clubId, userIdToKick } = data;
        const adminId = socket.user.id;

        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");
        if (!club.isModerator(adminId)) {
          return sendError(socket, "Only admins/moderators can kick members");
        }
        if (club.isAdmin(userIdToKick)) {
          return sendError(socket, "Cannot kick club admin");
        }

        const memberIndex = club.members.findIndex(
          (m) => m.user.toString() === userIdToKick
        );
        if (memberIndex === -1) {
          return sendError(socket, "User is not a member of this club");
        }

        club.members[memberIndex].status = "KICKED";
        await club.save();

        io.to(userIdToKick).emit(CLUB_EVENTS.MEMBER_KICKED, {
          clubId,
          clubName: club.name,
          kickedBy: adminId,
        });

        io.to(clubId).emit(CLUB_EVENTS.MEMBER_KICKED, {
          clubId,
          userId: userIdToKick,
          kickedBy: adminId,
        });
      } catch (error) {
        console.error("KICK_MEMBER error:", error);
        sendError(socket, "Failed to kick member", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user?.id} disconnected from club socket`);
      socket.joinedClubs.forEach((clubId) => socket.leave(clubId));
      socket.joinedClubs.clear();
    });
  });
};
