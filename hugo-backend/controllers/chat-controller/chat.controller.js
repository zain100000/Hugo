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

const getOrCreateChat = async (user1, user2) => {
  if (
    !mongoose.Types.ObjectId.isValid(user1) ||
    !mongoose.Types.ObjectId.isValid(user2)
  ) {
    throw new Error("Invalid user IDs");
  }

  const participants = [user1, user2].sort();
  let chat = await Chat.findOne({
    participants: { $all: participants },
    isActive: true,
  })
    .populate("participants", "userName profilePicture")
    .populate("messages.sender", "userName profilePicture")
    .populate("lastMessage.sender", "userName profilePicture");

  if (chat) return chat;

  chat = new Chat({
    participants,
    messages: [],
    lastMessage: { text: "Chat started", sentAt: new Date(), sender: user1 },
    isActive: true,
  });

  await chat.save();

  return Chat.findById(chat._id)
    .populate("participants", "userName profilePicture")
    .populate("messages.sender", "userName profilePicture")
    .populate("lastMessage.sender", "userName profilePicture");
};

const findUserSocket = (io, userId) => {
  const sockets = io.sockets.sockets;
  for (let socket of sockets.values()) {
    if (socket.user?.id === userId) return socket;
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
    if (!userId) return sendError(socket, "Unauthorized: user ID missing");

    socket.join(`user_${userId}`);

    // ---------------- GET ALL CHATS ----------------
    socket.on(CHAT_EVENTS.GET_CHATS, async () => {
      try {
        const chats = await Chat.find({ participants: userId, isActive: true })
          .populate("participants", "userName profilePicture")
          .populate("lastMessage.sender", "userName profilePicture")
          .sort({ "lastMessage.sentAt": -1 });

        socket.emit(CHAT_EVENTS.CHATS_LIST, {
          success: true,
          message: "Chats retrieved",
          chats,
        });
      } catch (error) {
        sendError(socket, "Failed to get chats", error.message);
      }
    });

    // ---------------- CREATE CHAT ----------------
    socket.on(CHAT_EVENTS.CREATE_CHAT, async ({ otherUserId }) => {
      try {
        if (!otherUserId) return sendError(socket, "Other user ID required");
        if (otherUserId === userId)
          return sendError(socket, "Cannot create chat with yourself");

        const chat = await getOrCreateChat(userId, otherUserId);
        socket.emit(CHAT_EVENTS.CHAT_CREATED, { success: true, chat });
      } catch (error) {
        sendError(socket, "Failed to create chat", error.message);
      }
    });

    // ---------------- GET MESSAGE HISTORY ----------------
    socket.on(
      CHAT_EVENTS.GET_MESSAGE_HISTORY,
      async ({ chatId, limit = 50, skip = 0 }) => {
        try {
          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
          })
            .populate("messages.sender", "userName profilePicture")
            .populate("messages.readBy.user", "userName profilePicture");

          if (!chat) return sendError(socket, "Chat not found");

          const messages = chat.messages
            .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
            .slice(skip, skip + limit);

          socket.emit(CHAT_EVENTS.MESSAGE_HISTORY, {
            success: true,
            chatId,
            messages,
            hasMore: chat.messages.length > skip + limit,
          });
        } catch (error) {
          sendError(socket, "Failed to get messages", error.message);
        }
      }
    );

    // ---------------- SEND MESSAGE ----------------
    socket.on(
      CHAT_EVENTS.SEND_MESSAGE,
      async ({ chatId, text, messageType = "TEXT", mediaUrl, fileSize }) => {
        try {
          if (!text && !mediaUrl)
            return sendError(socket, "Text or media required");

          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
          });
          if (!chat) return sendError(socket, "Chat not found");

          const otherParticipant = chat.participants.find(
            (p) => p.toString() !== userId
          );

          const User = mongoose.models.User || mongoose.model("User");
          const user = await User.findById(userId);
          if (!user || user.coins <= 0)
            return sendError(socket, "Not enough coins");

          user.coins -= 40;
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

          const populatedChat = await Chat.findById(chatId)
            .populate("messages.sender", "userName profilePicture")
            .populate("lastMessage.sender", "userName profilePicture");

          const sentMessage =
            populatedChat.messages[populatedChat.messages.length - 1];

          socket.emit(CHAT_EVENTS.NEW_MESSAGE, {
            success: true,
            chatId,
            message: sentMessage,
            remainingCoins: user.coins,
          });

          const recipientSocket = findUserSocket(
            io,
            otherParticipant.toString()
          );
          if (recipientSocket)
            recipientSocket.emit(CHAT_EVENTS.NEW_MESSAGE, {
              chatId,
              message: sentMessage,
            });
        } catch (error) {
          sendError(socket, "Failed to send message", error.message);
        }
      }
    );

    // ---------------- MARK AS READ ----------------
    socket.on(CHAT_EVENTS.MARK_AS_READ, async ({ chatId, messageIds }) => {
      try {
        if (!chatId || !Array.isArray(messageIds))
          return sendError(socket, "Invalid data");

        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId,
          isActive: true,
        });
        if (!chat) return sendError(socket, "Chat not found");

        const updatedMessages = [];

        chat.messages.forEach((msg) => {
          if (messageIds.includes(msg._id.toString())) {
            msg.isRead = true;
            if (!msg.readBy.some((r) => r.user.toString() === userId))
              msg.readBy.push({ user: userId, readAt: new Date() });
            updatedMessages.push(msg);
          }
        });

        await chat.save();

        updatedMessages.forEach((msg) => {
          const senderSocket = findUserSocket(io, msg.sender.toString());
          if (senderSocket)
            senderSocket.emit(CHAT_EVENTS.MESSAGE_READ, {
              chatId,
              messageId: msg._id,
              readerId: userId,
            });
        });

        socket.emit(CHAT_EVENTS.MESSAGE_READ, {
          chatId,
          messageIds,
          success: true,
        });
      } catch (error) {
        sendError(socket, "Failed to mark messages as read", error.message);
      }
    });

    // ---------------- DELETE MESSAGE ----------------
    socket.on(CHAT_EVENTS.DELETE_MESSAGE, async ({ chatId, messageId }) => {
      try {
        if (!chatId || !messageId)
          return sendError(socket, "ChatId and messageId required");

        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId,
          isActive: true,
        });
        if (!chat) return sendError(socket, "Chat not found");

        const msgIndex = chat.messages.findIndex(
          (msg) =>
            msg._id.toString() === messageId && msg.sender.toString() === userId
        );
        if (msgIndex === -1)
          return sendError(socket, "Message not found or not owned by you");

        chat.messages.splice(msgIndex, 1);

        // Update lastMessage if deleted message was lastMessage
        if (chat.lastMessage._id?.toString() === messageId) {
          const lastMsg = chat.messages[chat.messages.length - 1];
          chat.lastMessage = lastMsg
            ? {
                text: lastMsg.text || "",
                sender: lastMsg.sender,
                sentAt: lastMsg.sentAt,
              }
            : {
                text: "Chat started",
                sender: chat.participants[0],
                sentAt: new Date(),
              };
        }

        await chat.save();

        socket.emit(CHAT_EVENTS.MESSAGE_DELETED, { chatId, messageId });

        chat.participants.forEach((p) => {
          if (p.toString() !== userId) {
            const psocket = findUserSocket(io, p.toString());
            if (psocket)
              psocket.emit(CHAT_EVENTS.MESSAGE_DELETED, { chatId, messageId });
          }
        });
      } catch (error) {
        sendError(socket, "Failed to delete message", error.message);
      }
    });

    // ---------------- DISCONNECT ----------------
    socket.on("disconnect", () => {
      console.log(`🔴 User ${socket.user?.id} disconnected`);
      socket.leave(`user_${userId}`);
    });
  });
};
