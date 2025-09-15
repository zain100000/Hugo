const mongoose = require("mongoose");
const Club = require("../../models/club-model/club.model");
const ClubChat = require("../../models/club-chat-model/club.chat.model");

// 🔹 Organized Events
const CLUB_EVENTS = {
  // 🔸 Client → Server (emit)
  CREATE_CLUB: "createClub",
  DELETE_CLUB: "deleteClub",
  JOIN_CLUB: "joinClub",
  LEAVE_CLUB: "leaveClub",
  GET_CLUB_MEMBERS: "getClubMembers",
  SEND_MESSAGE: "sendMessage",
  GET_MESSAGE_HISTORY: "getMessageHistory",
  DELETE_MESSAGE: "deleteMessage",
  KICK_MEMBER: "kickMember",
  BAN_MEMBER: "banMember",
  MUTE_MEMBER: "muteMember",
  INVITE_USER: "inviteUser",

  // 🔸 Server → Client (listen)
  CLUB_CREATED: "clubCreated",
  CLUB_DELETED: "clubDeleted",
  CLUB_JOINED: "clubJoined",
  CLUB_LEFT: "clubLeft",
  CLUB_MEMBERS: "clubMembers",
  NEW_MESSAGE: "newMessage",
  MESSAGE_HISTORY: "messageHistory",
  MESSAGE_DELETED: "messageDeleted",
  MEMBER_KICKED: "memberKicked",
  MEMBER_BANNED: "memberBanned",
  MEMBER_MUTED: "memberMuted",
  USER_INVITED: "userInvited",

  // 🔸 Errors
  ERROR: "error",
};

// ---------- Response Helpers ----------
const sendError = (socket, message, details = null) => {
  const errorResponse = {
    success: false,
    message,
    ...(details && { details }),
  };
  socket.emit(CLUB_EVENTS.ERROR, errorResponse);
  return errorResponse;
};

const broadcastSuccess = (io, room, event, message, data = null) => {
  const response = { success: true, message, ...(data && { data }) };
  io.to(room).emit(event, response);
  return response;
};

// ---------- Main Club Socket ----------
exports.initializeClubSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log(`✅ User ${socket.user?.id} connected to club socket`);
    socket.joinedClubs = new Set();

    try {
      const userId = socket.user.id;
      const clubs = await Club.find({ "members.user": userId });

      clubs.forEach((club) => {
        socket.join(club._id.toString());
        socket.joinedClubs.add(club._id.toString());
      });

      console.log(
        `📌 Auto-joined ${clubs.length} clubs for user ${userId}:`,
        Array.from(socket.joinedClubs)
      );
    } catch (err) {
      console.error("Auto-join error:", err);
    }

    // ---------- CREATE CLUB ----------
    socket.on(CLUB_EVENTS.CREATE_CLUB, async (data) => {
      try {
        const { name, isPublic = true } = data;
        const userId = socket.user.id;

        if (!name || typeof name !== "string") {
          return sendError(socket, "Club name is required");
        }

        const club = new Club({
          name,
          isPublic,
          admin: userId,
          members: [{ user: userId, role: "ADMIN", status: "ACTIVE" }],
        });

        await club.save();

        socket.join(club._id.toString());
        socket.joinedClubs.add(club._id.toString());

        broadcastSuccess(
          io,
          club._id.toString(),
          CLUB_EVENTS.CLUB_CREATED,
          "Club created",
          {
            clubId: club._id,
            name: club.name,
          }
        );
      } catch (error) {
        console.error("CREATE_CLUB error:", error);
        sendError(socket, "Failed to create club", error.message);
      }
    });

    // ---------- DELETE CLUB ----------
    socket.on(CLUB_EVENTS.DELETE_CLUB, async ({ clubId }) => {
      try {
        const userId = socket.user.id;
        const club = await Club.findById(clubId);

        if (!club) return sendError(socket, "Club not found");
        if (!club.isAdmin(userId)) {
          return sendError(socket, "Only admins can delete the club");
        }

        await club.deleteOne();
        broadcastSuccess(io, clubId, CLUB_EVENTS.CLUB_DELETED, "Club deleted", {
          clubId,
        });
      } catch (error) {
        console.error("DELETE_CLUB error:", error);
        sendError(socket, "Failed to delete club", error.message);
      }
    });

    // ---------- JOIN CLUB ----------
    socket.on(CLUB_EVENTS.JOIN_CLUB, async ({ clubId }) => {
      try {
        const userId = socket.user.id;
        if (!mongoose.Types.ObjectId.isValid(clubId)) {
          return sendError(socket, "Invalid club ID");
        }

        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");
        if (club.isBanned(userId)) {
          return sendError(socket, "You are banned from this club");
        }
        if (!club.isPublic && !club.isMember(userId)) {
          return sendError(socket, "Private club, request denied");
        }

        if (!club.isMember(userId)) {
          club.members.push({ user: userId, role: "MEMBER", status: "ACTIVE" });
          await club.save();
        }

        socket.join(clubId);
        socket.joinedClubs.add(clubId);

        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.CLUB_JOINED,
          "User joined club",
          {
            clubId,
            userId,
            clubName: club.name,
          }
        );
      } catch (error) {
        console.error("JOIN_CLUB error:", error);
        sendError(socket, "Failed to join club", error.message);
      }
    });

    // ---------- LEAVE CLUB ----------
    socket.on(CLUB_EVENTS.LEAVE_CLUB, async ({ clubId }) => {
      try {
        const userId = socket.user.id;
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const memberIndex = club.members.findIndex(
          (m) => m.user.toString() === userId
        );
        if (memberIndex === -1) {
          return sendError(socket, "You are not a member of this club");
        }

        club.members.splice(memberIndex, 1);
        await club.save();

        socket.leave(clubId);
        socket.joinedClubs.delete(clubId);

        broadcastSuccess(io, clubId, CLUB_EVENTS.CLUB_LEFT, "User left club", {
          clubId,
          userId,
        });
      } catch (error) {
        console.error("LEAVE_CLUB error:", error);
        sendError(socket, "Failed to leave club", error.message);
      }
    });

    // ---------- GET MEMBERS ----------
    socket.on(CLUB_EVENTS.GET_CLUB_MEMBERS, async ({ clubId }) => {
      try {
        const club = await Club.findById(clubId).populate(
          "members.user",
          "userName profilePicture"
        );

        if (!club) return sendError(socket, "Club not found");

        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.CLUB_MEMBERS,
          "Club members retrieved",
          {
            clubId,
            members: club.members,
          }
        );
      } catch (error) {
        console.error("GET_CLUB_MEMBERS error:", error);
        sendError(socket, "Failed to get club members", error.message);
      }
    });

    // ---------- SEND MESSAGE ----------
    socket.on(
      CLUB_EVENTS.SEND_MESSAGE,
      async ({ clubId, text, type, replyTo }) => {
        try {
          const userId = socket.user.id;
          if (!socket.joinedClubs.has(clubId)) {
            return sendError(socket, "You are not in this club");
          }

          const club = await Club.findById(clubId);
          if (!club) return sendError(socket, "Club not found");

          const member = club.members.find((m) => m.user.toString() === userId);
          if (!member || member.status === "MUTED") {
            return sendError(socket, "You cannot send messages in this club");
          }

          const user = await mongoose.model("User").findById(userId);
          if (!user) return sendError(socket, "User not found");
          if (user.coins <= 0) {
            return sendError(socket, "Not enough coins to send message");
          }

          user.coins -= 1;
          await user.save();

          const message = new ClubChat({
            club: clubId,
            sender: userId,
            text,
            type: type || "TEXT",
            replyTo,
          });

          await message.save();
          await message.populate("sender", "userName profilePicture");

          const payload = {
            message: {
              _id: message._id,
              text: message.text,
              type: message.type,
              sender: message.sender,
              createdAt: message.createdAt,
              replyTo: message.replyTo,
            },
            clubId,
            remainingCoins: user.coins,
          };

          broadcastSuccess(
            io,
            clubId,
            CLUB_EVENTS.NEW_MESSAGE,
            "New message",
            payload
          );
        } catch (error) {
          console.error("SEND_MESSAGE error:", error);
          sendError(socket, "Failed to send message", error.message);
        }
      }
    );

    // ---------- GET MESSAGE HISTORY ----------
    socket.on(
      CLUB_EVENTS.GET_MESSAGE_HISTORY,
      async ({ clubId, limit = 50, skip = 0 }) => {
        try {
          if (!socket.joinedClubs.has(clubId)) {
            return sendError(socket, "You are not in this club");
          }

          const messages = await ClubChat.find({
            club: clubId,
            isDeleted: false,
          })
            .populate("sender", "userName profilePicture")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

          broadcastSuccess(
            io,
            clubId,
            CLUB_EVENTS.MESSAGE_HISTORY,
            "Message history retrieved",
            {
              messages: messages.reverse(),
              clubId,
            }
          );
        } catch (error) {
          console.error("GET_MESSAGE_HISTORY error:", error);
          sendError(socket, "Failed to get history", error.message);
        }
      }
    );

    // ---------- DELETE MESSAGE ----------
    socket.on(CLUB_EVENTS.DELETE_MESSAGE, async ({ messageId, clubId }) => {
      try {
        const userId = socket.user.id;

        const message = await ClubChat.findById(messageId);
        if (!message) return sendError(socket, "Message not found");

        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const canDelete =
          message.sender.toString() === userId || club.isModerator(userId);
        if (!canDelete) {
          return sendError(socket, "No permission to delete this message");
        }

        message.isDeleted = true;
        message.deletedBy = userId;
        message.deletedAt = new Date();
        await message.save();

        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.MESSAGE_DELETED,
          "Message deleted",
          {
            messageId,
            clubId,
            deletedBy: userId,
          }
        );
      } catch (error) {
        console.error("DELETE_MESSAGE error:", error);
        sendError(socket, "Failed to delete message", error.message);
      }
    });

    // ---------- KICK MEMBER ----------
    socket.on(CLUB_EVENTS.KICK_MEMBER, async ({ clubId, userIdToKick }) => {
      try {
        const adminId = socket.user.id;
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");
        if (!club.isModerator(adminId)) {
          return sendError(socket, "Only moderators can kick members");
        }
        if (club.isAdmin(userIdToKick)) {
          return sendError(socket, "Cannot kick club admin");
        }

        const memberIndex = club.members.findIndex(
          (m) => m.user.toString() === userIdToKick
        );
        if (memberIndex === -1) {
          return sendError(socket, "User is not in this club");
        }

        club.members.splice(memberIndex, 1);
        await club.save();

        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.MEMBER_KICKED,
          "Member kicked",
          {
            clubId,
            userId: userIdToKick,
            kickedBy: adminId,
          }
        );
      } catch (error) {
        console.error("KICK_MEMBER error:", error);
        sendError(socket, "Failed to kick member", error.message);
      }
    });

    // ---------- BAN MEMBER ----------
    socket.on(CLUB_EVENTS.BAN_MEMBER, async ({ clubId, userIdToBan }) => {
      try {
        const adminId = socket.user.id;
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");
        if (!club.isModerator(adminId)) {
          return sendError(socket, "Only moderators can ban members");
        }

        if (!club.bannedUsers.includes(userIdToBan)) {
          club.bannedUsers.push(userIdToBan);
          await club.save();
        }

        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.MEMBER_BANNED,
          "Member banned",
          {
            clubId,
            userId: userIdToBan,
            bannedBy: adminId,
          }
        );
      } catch (error) {
        console.error("BAN_MEMBER error:", error);
        sendError(socket, "Failed to ban member", error.message);
      }
    });

    // ---------- MUTE MEMBER ----------
    socket.on(CLUB_EVENTS.MUTE_MEMBER, async ({ clubId, userIdToMute }) => {
      try {
        const adminId = socket.user.id;
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");
        if (!club.isModerator(adminId)) {
          return sendError(socket, "Only moderators can mute members");
        }

        const member = club.members.find(
          (m) => m.user.toString() === userIdToMute
        );
        if (!member) return sendError(socket, "User is not in this club");

        member.status = "MUTED";
        await club.save();

        broadcastSuccess(io, clubId, CLUB_EVENTS.MEMBER_MUTED, "Member muted", {
          clubId,
          userId: userIdToMute,
          mutedBy: adminId,
        });
      } catch (error) {
        console.error("MUTE_MEMBER error:", error);
        sendError(socket, "Failed to mute member", error.message);
      }
    });

    // ---------- INVITE USER ----------
    socket.on(CLUB_EVENTS.INVITE_USER, async ({ clubId, userIdToInvite }) => {
      try {
        const adminId = socket.user.id;
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");
        if (!club.isModerator(adminId)) {
          return sendError(socket, "Only moderators can invite users");
        }

        broadcastSuccess(io, clubId, CLUB_EVENTS.USER_INVITED, "User invited", {
          clubId,
          userId: userIdToInvite,
          invitedBy: adminId,
        });
      } catch (error) {
        console.error("INVITE_USER error:", error);
        sendError(socket, "Failed to invite user", error.message);
      }
    });

    // ---------- DISCONNECT ----------
    socket.on("disconnect", () => {
      console.log(`❌ User ${socket.user?.id} disconnected from club socket`);
      socket.joinedClubs.forEach((clubId) => socket.leave(clubId));
      socket.joinedClubs.clear();
    });
  });
};
