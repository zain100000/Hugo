const mongoose = require("mongoose");
const Club = require("../../models/club-model/club.model");
const {
  uploadToCloudinary,
} = require("../../utilities/cloudinary/cloudinary.utility");

// 🔹 Club Socket Events
const CLUB_EVENTS = {
  // Client -> Server
  CREATE_CLUB: "createClub",
  DELETE_CLUB: "deleteClub",
  GET_CLUB_MEMBERS: "getClubMembers",
  GET_ALL_CLUBS: "getAllClubs",
  GET_MESSAGE_HISTORY: "getMessageHistory",
  DELETE_MESSAGE: "deleteMessage",
  KICK_MEMBER: "kickMember",
  BAN_MEMBER: "banMember",
  MUTE_MEMBER: "muteMember",
  JOIN_CLUB: "joinClub",
  LEAVE_CLUB: "leaveClub",
  SEND_MESSAGE: "sendMessage",
  // REMOVED: INVITE_USER

  // Server -> Client
  CLUB_CREATED: "clubCreated",
  CLUB_DELETED: "clubDeleted",
  CLUB_JOINED: "clubJoined",
  CLUB_LEFT: "clubLeft",
  CLUB_MEMBERS: "clubMembers",
  ALL_CLUBS: "allClubs",
  NEW_MESSAGE: "newMessage",
  MESSAGE_HISTORY: "messageHistory",
  MESSAGE_DELETED: "messageDeleted",
  MEMBER_KICKED: "memberKicked",
  MEMBER_BANNED: "memberBanned",
  MEMBER_MUTED: "memberMuted",
  // REMOVED: USER_INVITED

  ERROR: "error",
};

// -------------------------------------------------------------
// ---------- Helpers ------------------------------------------
// -------------------------------------------------------------

/**
 * Sends an error response back to the originating socket.
 */
const sendError = (socket, message, details = null) => {
  const errorResponse = {
    success: false,
    message,
    ...(details && { details }),
  };
  socket.emit(CLUB_EVENTS.ERROR, errorResponse);
  return errorResponse;
};

/**
 * Broadcasts a success message to a specific room.
 */
const broadcastSuccess = (io, room, event, message, extra = null) => {
  const response = { success: true, message, ...(extra && extra) };
  io.to(room).emit(event, response);
  return response;
};

// -------------------------------------------------------------
// ---------- Main Club Socket Initialization ------------------
// -------------------------------------------------------------

exports.initializeClubSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log(`✅ User ${socket.user?.id} connected to club socket`);

    socket.joinedClubs = new Set();
    const userId = socket.user.id;
    const userRole = socket.user.role;

    // Auto-join SuperAdmin management room
    if (userRole === "SUPERADMIN") {
      socket.join("superadmin-management-room");
    }

    // Auto-join user's clubs
    try {
      const clubs = await Club.find({ "members.user": userId });
      clubs.forEach((club) => {
        const clubIdStr = club._id.toString();
        socket.join(clubIdStr);
        socket.joinedClubs.add(clubIdStr);
      });
    } catch (err) {
      console.error("Auto-join error:", err);
    }

    // -------------------------------------------------------------
    // ---------- Club Management Handlers -------------------------
    // -------------------------------------------------------------

    // ---------- CREATE CLUB ----------
    socket.on(CLUB_EVENTS.CREATE_CLUB, async (data) => {
      try {
        let {
          name,
          isPublic = true,
          clubImage,
          description,
          rules,
          tags,
        } = data;

        if (!name || typeof name !== "string") {
          return sendError(socket, "Club name is required");
        }

        // Validate tags (max 5)
        if (tags && Array.isArray(tags)) {
          tags = tags.slice(0, 5);
        } else {
          tags = [];
        }

        // Upload to Cloudinary if file buffer provided
        let uploadedImage = null;
        if (clubImage && clubImage.buffer) {
          const uploaded = await uploadToCloudinary(clubImage, "clubImage");
          uploadedImage = uploaded.url;
        }

        // Create club
        const club = new Club({
          name,
          isPublic,
          admin: userId,
          members: [{ user: userId, role: "ADMIN", status: "ACTIVE" }],
          clubImage: uploadedImage,
          description: description || "",
          rules: rules || "",
          tags,
        });

        await club.save();

        const clubIdStr = club._id.toString();
        socket.join(clubIdStr);
        socket.joinedClubs.add(clubIdStr);

        const newClub = await Club.findById(club._id)
          .populate("admin", "userName profilePicture")
          .populate("members.user", "userName profilePicture");

        // Broadcast to SuperAdmins for real-time table update
        io.to("superadmin-management-room").emit(CLUB_EVENTS.CLUB_CREATED, {
          success: true,
          message: "New club created for management",
          club: newClub,
        });

        // Emit to creator
        socket.emit(CLUB_EVENTS.CLUB_CREATED, {
          success: true,
          message: "Club created successfully",
          club: newClub,
        });
      } catch (error) {
        console.error("CREATE_CLUB error:", error);
        sendError(socket, "Failed to create club", error.message);
      }
    });

    // ---------- GET ALL CLUBS (SuperAdmin use) ----------
    socket.on(CLUB_EVENTS.GET_ALL_CLUBS, async () => {
      try {
        const clubs = await Club.find()
          .populate("admin", "userName profilePicture")
          .populate("members.user", "userName profilePicture");

        socket.emit(CLUB_EVENTS.ALL_CLUBS, {
          success: true,
          message: "All clubs retrieved",
          clubs,
        });
      } catch (error) {
        sendError(socket, "Failed to get all clubs", error.message);
      }
    });

    // ---------- DELETE CLUB ----------
    socket.on(CLUB_EVENTS.DELETE_CLUB, async ({ clubId }) => {
      try {
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const isClubAdmin = club.admin.toString() === userId;
        const isSuperAdmin = userRole === "SUPERADMIN";

        if (!isClubAdmin && !isSuperAdmin) {
          return sendError(
            socket,
            "Only club admins or superadmins can delete the club"
          );
        }

        await club.deleteOne();

        const payload = { clubId };

        // Notify SuperAdmins to remove from their management list
        broadcastSuccess(
          io,
          "superadmin-management-room",
          CLUB_EVENTS.CLUB_DELETED,
          "Club deleted globally",
          payload
        );

        // Notify all club members
        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.CLUB_DELETED,
          "Club deleted",
          payload
        );
      } catch (error) {
        sendError(socket, "Failed to delete club", error.message);
      }
    });

    // ---------- JOIN CLUB ----------
    socket.on(CLUB_EVENTS.JOIN_CLUB, async ({ clubId }) => {
      try {
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const clubIdStr = clubId.toString();
        const isMember = club.members.some((m) => m.user.toString() === userId);

        if (!isMember) {
          club.members.push({ user: userId, role: "MEMBER", status: "ACTIVE" });
          await club.save();
        }

        socket.join(clubIdStr);
        socket.joinedClubs.add(clubIdStr);

        broadcastSuccess(
          io,
          clubIdStr,
          CLUB_EVENTS.CLUB_JOINED,
          "User joined",
          {
            clubId: clubIdStr,
            userId,
            clubName: club.name,
          }
        );
      } catch (error) {
        sendError(socket, "Failed to join club", error.message);
      }
    });

    // ---------- LEAVE CLUB ----------
    socket.on(CLUB_EVENTS.LEAVE_CLUB, async ({ clubId }) => {
      try {
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const memberIndex = club.members.findIndex(
          (m) => m.user.toString() === userId
        );
        if (memberIndex === -1) {
          return sendError(socket, "You are not a member of this club");
        }

        // Prevent the admin from leaving unless they delete the club first
        if (club.admin.toString() === userId) {
          return sendError(
            socket,
            "Admin cannot leave the club without deleting it"
          );
        }

        club.members.splice(memberIndex, 1);
        await club.save();

        const clubIdStr = clubId.toString();
        socket.leave(clubIdStr);
        socket.joinedClubs.delete(clubIdStr);

        broadcastSuccess(io, clubIdStr, CLUB_EVENTS.CLUB_LEFT, "User left", {
          clubId: clubIdStr,
          userId,
        });
      } catch (error) {
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

        socket.emit(CLUB_EVENTS.CLUB_MEMBERS, {
          success: true,
          message: "Club members retrieved",
          members: club.members,
          clubId,
        });
      } catch (error) {
        sendError(socket, "Failed to get members", error.message);
      }
    });

    // -------------------------------------------------------------
    // ---------- Messaging Handlers (Embedded Chats) --------------
    // -------------------------------------------------------------

    // ---------- SEND MESSAGE ----------
    socket.on(
      CLUB_EVENTS.SEND_MESSAGE,
      async ({ clubId, text, type, mediaUrl, replyTo }) => {
        try {
          if (!socket.joinedClubs.has(clubId)) {
            return sendError(socket, "You are not in this club");
          }

          const club = await Club.findById(clubId);
          if (!club) return sendError(socket, "Club not found");

          const member = club.members.find((m) => m.user.toString() === userId);
          if (
            !member ||
            member.status === "MUTED" ||
            member.status === "KICKED" ||
            member.status === "BANNED"
          ) {
            return sendError(
              socket,
              "You cannot send messages in this club (Muted, Kicked, or Banned)"
            );
          }

          // Placeholder for User Model access
          const User = mongoose.models.User || mongoose.model("User");
          const user = await User.findById(userId);

          // Coin check logic
          if (!user || user.coins <= 0) {
            return sendError(socket, "Not enough coins to send message");
          }

          user.coins -= 1;
          await user.save();

          // Create a new embedded message object with sentAt timestamp
          const newChat = {
            sender: userId,
            text,
            type: type || "TEXT",
            mediaUrl: mediaUrl || undefined,
            replyTo: replyTo || undefined,
            sentAt: new Date(), // Explicitly set the timestamp
          };

          // Push and save (Mongoose will automatically assign a new ObjectId to the subdocument)
          club.chats.push(newChat);
          await club.save();

          // Get the newly created chat subdocument, including its generated _id
          const savedMessage = club.chats[club.chats.length - 1];

          // Manually populate the sender info for the broadcast
          const populatedMessage = {
            ...savedMessage.toObject(),
            sender: {
              _id: user._id,
              userName: user.userName,
              profilePicture: user.profilePicture,
            },
          };

          broadcastSuccess(io, clubId, CLUB_EVENTS.NEW_MESSAGE, "New message", {
            message: populatedMessage,
            clubId,
            remainingCoins: user.coins,
          });
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
          const isSuperAdmin = userRole === "SUPERADMIN";

          // Allow SuperAdmin to access any club, regular users must be members
          if (!isSuperAdmin && !socket.joinedClubs.has(clubId)) {
            return sendError(socket, "You are not in this club");
          }

          const club = await Club.findById(clubId)
            .populate("chats.sender", "userName profilePicture")
            .lean();

          if (!club) return sendError(socket, "Club not found");

          let messages = club.chats;

          // Regular users do not see soft-deleted messages
          if (!isSuperAdmin) {
            messages = messages.filter((chat) => !chat.isDeleted);
          }

          // FIX: Add proper date validation before sorting to prevent 'getTime' errors
          messages = messages
            .map((message) => {
              // 1. Ensure createdAt exists and is a valid Date
              if (!message.createdAt) {
                // Try to extract timestamp from ObjectId if createdAt is missing
                if (
                  message._id &&
                  typeof message._id === "string" &&
                  message._id.length >= 8
                ) {
                  try {
                    const timestamp = parseInt(message._id.substring(0, 8), 16);
                    message.createdAt = new Date(timestamp * 1000);
                  } catch (e) {
                    message.createdAt = new Date(); // Fallback
                  }
                } else {
                  message.createdAt = new Date(); // Final fallback
                }
              }

              // 2. Ensure createdAt is a Date object (Mongoose .lean() might return string)
              if (!(message.createdAt instanceof Date)) {
                try {
                  message.createdAt = new Date(message.createdAt);
                } catch (e) {
                  // If date parsing fails, use fallback date
                  message.createdAt = new Date();
                }
              }

              return message;
            })
            // FIX: Safe sorting with date validation (newest first)
            .sort((a, b) => {
              const dateA = a.createdAt.getTime ? a.createdAt.getTime() : 0;
              const dateB = b.createdAt.getTime ? b.createdAt.getTime() : 0;
              return dateB - dateA; // Sort by newest first
            })
            .slice(skip, skip + limit)
            .reverse(); // Reverse for oldest first (chronological chat view)

          if (isSuperAdmin) {
            console.log(
              `📚 SuperAdmin ${userId} accessed messages for club ${clubId}, found ${messages.length} messages (including deleted)`
            );
          }

          socket.emit(CLUB_EVENTS.MESSAGE_HISTORY, {
            success: true,
            message: "Message history retrieved",
            messages,
            clubId,
          });
        } catch (error) {
          console.error("GET_MESSAGE_HISTORY error:", error);
          sendError(socket, "Failed to get history", error.message);
        }
      }
    );

    // ---------- DELETE MESSAGE (SuperAdmin Hard Delete) ----------
    socket.on(
      CLUB_EVENTS.DELETE_MESSAGE,
      async ({ clubId, messageId, reason }) => {
        try {
          if (userRole !== "SUPERADMIN") {
            return sendError(socket, "Permission denied. SuperAdmin only.");
          }

          const club = await Club.findById(clubId);
          if (!club) return sendError(socket, "Club not found");

          // Find the message index
          const messageIndex = club.chats.findIndex(
            (chat) => chat._id.toString() === messageId
          );
          if (messageIndex === -1) {
            return sendError(socket, "Message not found");
          }

          // HARD DELETE: Remove the message from the chats array
          club.chats.splice(messageIndex, 1);

          await club.save();

          console.log(
            `✅ Message ${messageId} HARD DELETED by SuperAdmin ${userId}`
          );

          const payload = {
            messageId,
            clubId,
            deletedBy: userId,
            reason: reason || "No reason provided",
            hardDelete: true, // Signal to clients this was a hard delete
          };

          // Send success response to the requesting socket
          socket.emit(CLUB_EVENTS.MESSAGE_DELETED, {
            success: true,
            message: "Message permanently deleted",
            data: payload,
          });

          // Broadcast to the club room for real-time updates (clients will remove it)
          io.to(clubId).emit(CLUB_EVENTS.MESSAGE_DELETED, {
            success: true,
            message: "Message permanently deleted by admin",
            data: payload,
          });
        } catch (error) {
          console.error("DELETE_MESSAGE error:", error);
          sendError(socket, "Failed to delete message", error.message);
        }
      }
    );

    // -------------------------------------------------------------
    // ---------- Member Moderation Handlers (FIXED) ---------------
    // -------------------------------------------------------------

    // ---------- KICK MEMBER ----------
    socket.on(CLUB_EVENTS.KICK_MEMBER, async ({ clubId, userId }) => {
      // Changed from userIdToKick
      try {
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const isAdmin = club.admin.toString() === userId;
        const isSuperAdmin = userRole === "SUPERADMIN";

        // Allow club admin or super admin to kick members
        if (!isAdmin && !isSuperAdmin) {
          return sendError(
            socket,
            "Only club admin or super admin can kick members"
          );
        }

        // Prevent kicking yourself
        if (userId === socket.user.id) {
          return sendError(socket, "Cannot kick yourself");
        }

        // Prevent non-SuperAdmins from kicking the club admin
        const targetIsAdmin = club.admin.toString() === userId;
        if (targetIsAdmin && !isSuperAdmin) {
          return sendError(socket, "Cannot kick admin");
        }

        // Remove member from club
        club.members = club.members.filter((m) => m.user.toString() !== userId);
        await club.save();

        // Notify the kicked user if they're connected
        const kickedUserSocket = findUserSocket(userId); // You'll need to implement this
        if (kickedUserSocket) {
          kickedUserSocket.leave(clubId);
          kickedUserSocket.joinedClubs?.delete(clubId);
        }

        socket.emit(CLUB_EVENTS.MEMBER_KICKED, {
          success: true,
          message: "Member kicked successfully",
          clubId,
          userId,
        });

        // Broadcast to club members
        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.MEMBER_KICKED,
          "Member kicked",
          {
            clubId,
            userId,
            kickedBy: socket.user.id,
          }
        );
      } catch (error) {
        console.error("KICK_MEMBER error:", error);
        sendError(socket, "Failed to kick member", error.message);
      }
    });

    // ---------- BAN MEMBER ----------
    socket.on(CLUB_EVENTS.BAN_MEMBER, async ({ clubId, userId }) => {
      // Changed from userIdToBan
      try {
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const isAdmin = club.admin.toString() === socket.user.id;
        const isSuperAdmin = userRole === "SUPERADMIN";

        // Allow club admin or super admin to ban members
        if (!isAdmin && !isSuperAdmin) {
          return sendError(
            socket,
            "Only club admin or super admin can ban members"
          );
        }

        // Prevent banning yourself
        if (userId === socket.user.id) {
          return sendError(socket, "Cannot ban yourself");
        }

        // Prevent non-SuperAdmins from banning the club admin
        const targetIsAdmin = club.admin.toString() === userId;
        if (targetIsAdmin && !isSuperAdmin) {
          return sendError(socket, "Cannot ban admin");
        }

        // Remove from members list
        club.members = club.members.filter((m) => m.user.toString() !== userId);

        // Add to banned list if not already banned
        if (!club.bannedUsers.includes(userId)) {
          club.bannedUsers.push(userId);
        }

        await club.save();

        // Notify the banned user if they're connected
        const bannedUserSocket = findUserSocket(userId);
        if (bannedUserSocket) {
          bannedUserSocket.leave(clubId);
          bannedUserSocket.joinedClubs?.delete(clubId);
        }

        socket.emit(CLUB_EVENTS.MEMBER_BANNED, {
          success: true,
          message: "Member banned successfully",
          clubId,
          userId,
        });

        // Broadcast to club members
        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.MEMBER_BANNED,
          "Member banned",
          {
            clubId,
            userId,
            bannedBy: socket.user.id,
          }
        );
      } catch (error) {
        console.error("BAN_MEMBER error:", error);
        sendError(socket, "Failed to ban member", error.message);
      }
    });

    // ---------- MUTE MEMBER ----------
    socket.on(CLUB_EVENTS.MUTE_MEMBER, async ({ clubId, userId }) => {
      // Changed from userIdToMute
      try {
        const club = await Club.findById(clubId);
        if (!club) return sendError(socket, "Club not found");

        const isAdmin = club.admin.toString() === socket.user.id;
        const isSuperAdmin = userRole === "SUPERADMIN";

        // Allow club admin or super admin to mute members
        if (!isAdmin && !isSuperAdmin) {
          return sendError(
            socket,
            "Only club admin or super admin can mute members"
          );
        }

        // Prevent muting yourself
        if (userId === socket.user.id) {
          return sendError(socket, "Cannot mute yourself");
        }

        // Prevent muting the club admin
        const targetIsAdmin = club.admin.toString() === userId;
        if (targetIsAdmin) {
          return sendError(socket, "Cannot mute admin");
        }

        const member = club.members.find((m) => m.user.toString() === userId);
        if (!member) return sendError(socket, "User not in this club");

        // Toggle mute status
        member.status = member.status === "MUTED" ? "ACTIVE" : "MUTED";
        await club.save();

        const action = member.status === "MUTED" ? "muted" : "unmuted";

        socket.emit(CLUB_EVENTS.MEMBER_MUTED, {
          success: true,
          message: `Member ${action} successfully`,
          clubId,
          userId,
          status: member.status,
        });

        // Broadcast to club members
        broadcastSuccess(
          io,
          clubId,
          CLUB_EVENTS.MEMBER_MUTED,
          `Member ${action}`,
          {
            clubId,
            userId,
            status: member.status,
            actionBy: socket.user.id,
          }
        );
      } catch (error) {
        console.error("MUTE_MEMBER error:", error);
        sendError(socket, "Failed to mute member", error.message);
      }
    });

    // Helper function to find user socket (you need to implement this)
    const findUserSocket = (userId) => {
      // This is a simplified version - you'll need to implement proper socket tracking
      const sockets = io.sockets.sockets;
      for (let socket of sockets.values()) {
        if (socket.user?.id === userId) {
          return socket;
        }
      }
      return null;
    };

    // -------------------------------------------------------------
    // ---------- Disconnect Handler -------------------------------
    // -------------------------------------------------------------

    socket.on("disconnect", () => {
      console.log(`❌ User ${socket.user?.id} disconnected from club socket`);
      socket.joinedClubs.forEach((clubId) => socket.leave(clubId));
      socket.joinedClubs.clear();
    });
  });
};
