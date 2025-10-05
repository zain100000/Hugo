import socketManager from '../Socket.Manager.utility';
import {CHAT_EVENTS} from '../socketEvents/Socket.Events.utility';

/**
 * ================================================
 *  CLIENT → SERVER EVENTS (Emits)
 * ================================================
 */

// 🔹 Create or get a chat between two users
export const createChat = data => {
  // Expected: { otherUserId: "USER_ID" }
  console.log('📤 Emitting CREATE_CHAT:', data);
  socketManager.emit(CHAT_EVENTS.CREATE_CHAT, data);
};

// 🔹 Get all active chats for the current user
export const getChats = () => {
  console.log('📤 Emitting GET_CHATS');
  socketManager.emit(CHAT_EVENTS.GET_CHATS);
};

// 🔹 Get paginated message history for a chat
export const getMessageHistory = data => {
  // Expected: { chatId, limit?: number, skip?: number }
  console.log('📤 Emitting GET_MESSAGE_HISTORY:', data);
  socketManager.emit(CHAT_EVENTS.GET_MESSAGE_HISTORY, data);
};

// 🔹 Send a message (text or media)
export const sendMessage = data => {
  // Expected: { chatId, text?, mediaUrl?, fileSize?, type? }
  console.log('📤 Emitting SEND_MESSAGE:', data);
  socketManager.emit(CHAT_EVENTS.SEND_MESSAGE, data);
};

// 🔹 Mark messages as read
export const markMessageAsRead = data => {
  // Expected: { chatId, messageIds: [] }
  console.log('📤 Emitting MARK_AS_READ:', data);
  socketManager.emit(CHAT_EVENTS.MARK_AS_READ, data);
};

// 🔹 Delete a message
export const deleteMessage = data => {
  // Expected: { chatId, messageId }
  console.log('📤 Emitting DELETE_MESSAGE:', data);
  socketManager.emit(CHAT_EVENTS.DELETE_MESSAGE, data);
};

// 🔹 Delete a chat
export const deleteChat = data => {
  // Expected: { chatId }
  console.log('📤 Emitting DELETE_CHAT:', data);
  socketManager.emit(CHAT_EVENTS.DELETE_CHAT, data);
};

/**
 * ================================================
 *  SERVER → CLIENT EVENTS (Listeners)
 * ================================================
 */

// 🔹 Chat created or retrieved
export const listenToChatCreated = callback => {
  socketManager.on(CHAT_EVENTS.CHAT_CREATED, callback);
};

// 🔹 All chats list retrieved
export const listenToChatsList = callback => {
  socketManager.on(CHAT_EVENTS.CHATS_LIST, callback);
};

// 🔹 New incoming message
export const listenToNewMessage = callback => {
  socketManager.on(CHAT_EVENTS.NEW_MESSAGE, callback);
};

// 🔹 Message history (pagination)
export const listenToMessageHistory = callback => {
  socketManager.on(CHAT_EVENTS.MESSAGE_HISTORY, callback);
};

// 🔹 Message read acknowledgment
export const listenToMessageRead = callback => {
  socketManager.on(CHAT_EVENTS.MESSAGE_READ, callback);
};

// 🔹 Message deleted
export const listenToMessageDeleted = callback => {
  socketManager.on(CHAT_EVENTS.MESSAGE_DELETED, callback);
};

// 🔹 Chat deleted
export const listenToChatDeleted = callback => {
  socketManager.on(CHAT_EVENTS.CHAT_DELETED, callback);
};

// 🔹 Socket error
export const listenToChatError = callback => {
  socketManager.on(CHAT_EVENTS.ERROR, callback);
};

/**
 * ================================================
 *  CLEANUP HELPERS (Remove listeners)
 * ================================================
 */

export const removeChatCreatedListener = () =>
  socketManager.off(CHAT_EVENTS.CHAT_CREATED);
export const removeChatsListListener = () =>
  socketManager.off(CHAT_EVENTS.CHATS_LIST);
export const removeNewMessageListener = () =>
  socketManager.off(CHAT_EVENTS.NEW_MESSAGE);
export const removeMessageHistoryListener = () =>
  socketManager.off(CHAT_EVENTS.MESSAGE_HISTORY);
export const removeMessageReadListener = () =>
  socketManager.off(CHAT_EVENTS.MESSAGE_READ);
export const removeMessageDeletedListener = () =>
  socketManager.off(CHAT_EVENTS.MESSAGE_DELETED);
export const removeChatDeletedListener = () =>
  socketManager.off(CHAT_EVENTS.CHAT_DELETED);
export const removeChatErrorListener = () =>
  socketManager.off(CHAT_EVENTS.ERROR);
