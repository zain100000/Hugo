const mongoose = require("mongoose");
const Chat = require("../../models/chat-model/chat.model");
const {
  uploadToCloudinary,
} = require("../../utilities/cloudinary/cloudinary.utility");

// 🔹 Personal Chat Socket Events
const CHAT_EVENTS = {
  // Client -> Server
  CREATE_CHAT: "createChat",
  GET_CHATS: "getChats",
  GET_MESSAGE_HISTORY: "getMessageHistory",
  SEND_MESSAGE: "sendMessage",
  MARK_AS_READ: "markAsRead",
  DELETE_MESSAGE: "deleteMessage",
  DELETE_CHAT: "deleteChat",

  // Server -> Client
  CHAT_CREATED: "chatCreated",
  CHATS_LIST: "chatsList",
  NEW_MESSAGE: "newMessage",
  MESSAGE_HISTORY: "messageHistory",
  MESSAGE_READ: "messageRead",
  MESSAGE_DELETED: "messageDeleted",
  CHAT_DELETED: "chatDeleted",
  ERROR: "error",
};

// -------------------------------------------------------------
// ---------- Helpers ------------------------------------------
// -------------------------------------------------------------

const sendError = (socket, message, details = null) => {
  const errorResponse = {
    success: false,
    message,
    ...(details && { details }),
  };
  console.log("⚠️ sendError:", errorResponse);
  socket.emit(CHAT_EVENTS.ERROR, errorResponse);
  return errorResponse;
};

// -------------------------------------------------------------
// ---------- getOrCreateChat Helper ---------------------------
// -------------------------------------------------------------
const getOrCreateChat = async (user1, user2) => {
  console.log("🔹 getOrCreateChat() called with:", user1, user2);

  if (
    !mongoose.Types.ObjectId.isValid(user1) ||
    !mongoose.Types.ObjectId.isValid(user2)
  ) {
    console.log("❌ Invalid ObjectId(s) passed to getOrCreateChat");
    throw new Error("Invalid user IDs");
  }

  const participants = [user1, user2].sort();
  console.log("📋 Sorted participants:", participants);

  let chat = await Chat.findOne({
    participants: { $all: participants },
    isActive: true,
  })
    .populate("participants", "userName profilePicture")
    .populate("messages.sender", "userName profilePicture")
    .populate("lastMessage.sender", "userName profilePicture");

  if (chat) {
    console.log("✅ Existing chat found:", chat._id);
    return chat;
  }

  console.log("🆕 No chat found — creating new chat...");

  chat = new Chat({
    participants,
    messages: [],
    lastMessage: {
      text: "Chat started",
      sentAt: new Date(),
      sender: user1,
    },
    isActive: true,
  });

  await chat.save();
  console.log("💾 Chat saved to MongoDB:", chat._id);

  chat = await Chat.findById(chat._id)
    .populate("participants", "userName profilePicture")
    .populate("messages.sender", "userName profilePicture")
    .populate("lastMessage.sender", "userName profilePicture");

  console.log("✅ Chat populated and ready:", chat._id);
  return chat;
};

// -------------------------------------------------------------
// ---------- Find User Socket ---------------------------------
// -------------------------------------------------------------
const findUserSocket = (io, userId) => {
  const sockets = io.sockets.sockets;
  for (let socket of sockets.values()) {
    if (socket.user?.id === userId) {
      return socket;
    }
  }
  return null;
};

// -------------------------------------------------------------
// ---------- Main Chat Socket Initialization ------------------
// -------------------------------------------------------------
exports.initializeChatSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("🟢 Chat socket connected:", socket.user);

    const userId = socket.user?.id;
    if (!userId) {
      console.log("❌ No socket.user.id found — connection unauthorized");
      return sendError(socket, "Unauthorized: user ID missing from socket");
    }

    // Join personal room
    socket.join(`user_${userId}`);
    console.log(`👥 User ${userId} joined personal room user_${userId}`);

    // -------------------------------------------------------------
    // ---------- GET ALL CHATS -----------------------------------
    // -------------------------------------------------------------
    socket.on(CHAT_EVENTS.GET_CHATS, async () => {
      console.log(`📨 [${userId}] -> getChats`);
      try {
        const chats = await Chat.find({
          participants: userId,
          isActive: true,
        })
          .populate("participants", "userName profilePicture")
          .populate("lastMessage.sender", "userName profilePicture")
          .sort({ "lastMessage.sentAt": -1 });

        console.log(`✅ Found ${chats.length} chats for user ${userId}`);
        socket.emit(CHAT_EVENTS.CHATS_LIST, {
          success: true,
          message: "Chats retrieved successfully",
          chats,
        });
      } catch (error) {
        console.error("❌ GET_CHATS error:", error);
        sendError(socket, "Failed to get chats", error.message);
      }
    });

    // -------------------------------------------------------------
    // ---------- CREATE / GET CHAT --------------------------------
    // -------------------------------------------------------------
    socket.on(CHAT_EVENTS.CREATE_CHAT, async ({ otherUserId }) => {
      console.log(`📨 [${userId}] -> createChat:`, otherUserId);

      try {
        if (!otherUserId) {
          console.log("❌ Missing otherUserId");
          return sendError(socket, "Other user ID is required");
        }

        if (otherUserId === userId) {
          console.log("❌ Attempted to create chat with self");
          return sendError(socket, "Cannot create chat with yourself");
        }

        const chat = await getOrCreateChat(userId, otherUserId);

        console.log("✅ Chat created/retrieved successfully:", chat._id);

        socket.emit(CHAT_EVENTS.CHAT_CREATED, {
          success: true,
          message: "Chat created/retrieved successfully",
          chat,
        });
      } catch (error) {
        console.error("❌ CREATE_CHAT error:", error);
        sendError(socket, "Failed to create chat", error.message);
      }
    });

    // -------------------------------------------------------------
    // ---------- GET MESSAGE HISTORY ------------------------------
    // -------------------------------------------------------------
    socket.on(
      CHAT_EVENTS.GET_MESSAGE_HISTORY,
      async ({ chatId, limit = 50, skip = 0 }) => {
        console.log(`📨 [${userId}] -> getMessageHistory: ${chatId}`);

        try {
          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
          })
            .populate("messages.sender", "userName profilePicture")
            .populate("messages.readBy.user", "userName profilePicture");

          if (!chat) {
            return sendError(socket, "Chat not found or access denied");
          }

          const messages = chat.messages
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            .slice(skip, skip + limit)
            .reverse();

          console.log(
            `📨 Returning ${messages.length} messages from chat ${chatId}`
          );

          socket.emit(CHAT_EVENTS.MESSAGE_HISTORY, {
            success: true,
            message: "Message history retrieved",
            messages,
            chatId,
            hasMore: chat.messages.length > skip + limit,
          });
        } catch (error) {
          console.error("❌ GET_MESSAGE_HISTORY error:", error);
          sendError(socket, "Failed to get message history", error.message);
        }
      }
    );

    // -------------------------------------------------------------
    // ---------- SEND MESSAGE -------------------------------------
    // -------------------------------------------------------------
    socket.on(
      CHAT_EVENTS.SEND_MESSAGE,
      async ({ chatId, text, messageType = "TEXT", mediaUrl, fileSize }) => {
        console.log(
          `📨 [${userId}] -> sendMessage: chatId=${chatId}, text=${text}`
        );

        try {
          if (!text && !mediaUrl) {
            return sendError(socket, "Message text or media is required");
          }

          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
          });

          if (!chat) {
            return sendError(socket, "Chat not found or access denied");
          }

          console.log("✅ Chat found:", chatId);

          const otherParticipant = chat.participants.find(
            (participant) => participant.toString() !== userId
          );

          const User = mongoose.models.User || mongoose.model("User");
          const user = await User.findById(userId);

          if (!user || user.coins <= 0) {
            return sendError(socket, "Not enough coins to send message");
          }

          user.coins -= 1;
          await user.save();

          const newMessage = {
            sender: userId,
            text: text || "",
            messageType,
            mediaUrl: mediaUrl || undefined,
            fileSize: fileSize || undefined,
            isRead: false,
            readBy: [],
            sentAt: new Date(),
          };

          chat.messages.push(newMessage);

          chat.lastMessage = {
            text:
              text || (mediaUrl ? `Sent a ${messageType.toLowerCase()}` : ""),
            sentAt: new Date(),
            sender: userId,
          };

          await chat.save();
          console.log("💾 Message saved successfully in chat:", chatId);

          const populatedChat = await Chat.findById(chatId)
            .populate("messages.sender", "userName profilePicture")
            .populate("lastMessage.sender", "userName profilePicture");

          const sentMessage =
            populatedChat.messages[populatedChat.messages.length - 1];

          socket.emit(CHAT_EVENTS.NEW_MESSAGE, {
            success: true,
            message: "Message sent successfully",
            chatId,
            message: sentMessage,
            remainingCoins: user.coins,
          });

          const recipientSocket = findUserSocket(
            io,
            otherParticipant.toString()
          );
          if (recipientSocket) {
            console.log("📩 Delivering message to recipient socket");
            recipientSocket.emit(CHAT_EVENTS.NEW_MESSAGE, {
              success: true,
              message: "New message received",
              chatId,
              message: sentMessage,
            });
          }
        } catch (error) {
          console.error("❌ SEND_MESSAGE error:", error);
          sendError(socket, "Failed to send message", error.message);
        }
      }
    );

    // -------------------------------------------------------------
    // ---------- DISCONNECT ---------------------------------------
    // -------------------------------------------------------------
    socket.on("disconnect", () => {
      console.log(`🔴 User ${socket.user?.id} disconnected`);
      socket.leave(`user_${userId}`);
    });
  });
};
