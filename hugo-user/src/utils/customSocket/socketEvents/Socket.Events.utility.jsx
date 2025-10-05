// ========================================
// 🔹 CHAT SOCKET EVENT CONSTANTS
// ========================================

export const CHAT_EVENTS = {
  // ======================
  // 🔸 Client → Server (emit)
  // ======================

  CREATE_CHAT: 'createChat', // Create or get a chat between two users
  GET_CHATS: 'getChats', // Get all chats for current user
  GET_MESSAGE_HISTORY: 'getMessageHistory', // Get messages for a specific chat
  SEND_MESSAGE: 'sendMessage', // Send a message in a chat
  MARK_AS_READ: 'markAsRead', // Mark message(s) as read
  DELETE_MESSAGE: 'deleteMessage', // Delete a specific message
  DELETE_CHAT: 'deleteChat', // Delete entire chat

  // ======================
  // 🔸 Server → Client (listen)
  // ======================

  CHAT_CREATED: 'chatCreated', // Chat successfully created or retrieved
  CHATS_LIST: 'chatsList', // List of all chats returned
  NEW_MESSAGE: 'newMessage', // New incoming or outgoing message
  MESSAGE_HISTORY: 'messageHistory', // Message history of a chat
  MESSAGE_READ: 'messageRead', // Notification when a message is read
  MESSAGE_DELETED: 'messageDeleted', // Message was deleted
  CHAT_DELETED: 'chatDeleted', // Entire chat was deleted
  ERROR: 'error', // Error event for chat actions
};
