import socketManager from '../Socket.Manager.utility';
import {CHAT_EVENTS, CLUB_EVENTS} from '../socketEvents/Socket.Events.utility';

/**
 * ================================================
 *  CLIENT → SERVER EVENTS (Emits)
 * ================================================
 */

/** --------- CHAT EVENTS --------- */

// 🔹 Create or get a chat between two users
export const createChat = data => {
  console.log('📤 Emitting CREATE_CHAT:', data);
  socketManager.emit(CHAT_EVENTS.CREATE_CHAT, data);
};

// 🔹 Get all active chats
export const getChats = () => {
  console.log('📤 Emitting GET_CHATS');
  socketManager.emit(CHAT_EVENTS.GET_CHATS);
};

// 🔹 Get paginated message history
export const getMessageHistory = data => {
  console.log('📤 Emitting GET_MESSAGE_HISTORY:', data);
  socketManager.emit(CHAT_EVENTS.GET_MESSAGE_HISTORY, data);
};

// 🔹 Send a chat message
export const sendMessage = data => {
  console.log('📤 Emitting SEND_MESSAGE:', data);
  socketManager.emit(CHAT_EVENTS.SEND_MESSAGE, data);
};

// 🔹 Mark messages as read
export const markMessageAsRead = data => {
  console.log('📤 Emitting MARK_AS_READ:', data);
  socketManager.emit(CHAT_EVENTS.MARK_AS_READ, data);
};

// 🔹 Delete a message
export const deleteMessage = data => {
  console.log('📤 Emitting DELETE_MESSAGE:', data);
  socketManager.emit(CHAT_EVENTS.DELETE_MESSAGE, data);
};

// 🔹 Delete a chat
export const deleteChat = data => {
  console.log('📤 Emitting DELETE_CHAT:', data);
  socketManager.emit(CHAT_EVENTS.DELETE_CHAT, data);
};

/** --------- CLUB EVENTS --------- */

// 🔹 Create a club
export const createClub = data => {
  console.log('📤 Emitting CREATE_CLUB:', data);
  socketManager.emit(CLUB_EVENTS.CREATE_CLUB, data);
};

// 🔹 Get all clubs (SuperAdmin)
export const getAllClubs = () => {
  console.log('📤 Emitting GET_ALL_CLUBS');
  socketManager.emit(CLUB_EVENTS.GET_ALL_CLUBS);
};

// 🔹 Delete a club
export const deleteClub = data => {
  console.log('📤 Emitting DELETE_CLUB:', data);
  socketManager.emit(CLUB_EVENTS.DELETE_CLUB, data);
};

// 🔹 Join a club
export const joinClub = data => {
  console.log('📤 Emitting JOIN_CLUB:', data);
  socketManager.emit(CLUB_EVENTS.JOIN_CLUB, data);
};

// 🔹 Leave a club
export const leaveClub = data => {
  console.log('📤 Emitting LEAVE_CLUB:', data);
  socketManager.emit(CLUB_EVENTS.LEAVE_CLUB, data);
};

// 🔹 Get club members
export const getClubMembers = data => {
  console.log('📤 Emitting GET_CLUB_MEMBERS:', data);
  socketManager.emit(CLUB_EVENTS.GET_CLUB_MEMBERS, data);
};

// 🔹 Send a club message
export const sendClubMessage = data => {
  console.log('📤 Emitting SEND_MESSAGE:', data);
  socketManager.emit(CLUB_EVENTS.SEND_MESSAGE, data);
};

// 🔹 Get club message history
export const getClubMessageHistory = data => {
  console.log('📤 Emitting GET_MESSAGE_HISTORY:', data);
  socketManager.emit(CLUB_EVENTS.GET_MESSAGE_HISTORY, data);
};

// 🔹 Delete a club message (SuperAdmin)
export const deleteClubMessage = data => {
  console.log('📤 Emitting DELETE_MESSAGE:', data);
  socketManager.emit(CLUB_EVENTS.DELETE_MESSAGE, data);
};

// 🔹 Kick a member
export const kickMember = data => {
  console.log('📤 Emitting KICK_MEMBER:', data);
  socketManager.emit(CLUB_EVENTS.KICK_MEMBER, data);
};

// 🔹 Ban a member
export const banMember = data => {
  console.log('📤 Emitting BAN_MEMBER:', data);
  socketManager.emit(CLUB_EVENTS.BAN_MEMBER, data);
};

// 🔹 Mute/unmute a member
export const muteMember = data => {
  console.log('📤 Emitting MUTE_MEMBER:', data);
  socketManager.emit(CLUB_EVENTS.MUTE_MEMBER, data);
};

/**
 * ================================================
 *  SERVER → CLIENT EVENTS (Listeners)
 * ================================================
 */

/** --------- CHAT LISTENERS --------- */
export const listenToChatCreated = callback =>
  socketManager.on(CHAT_EVENTS.CHAT_CREATED, callback);
export const listenToChatsList = callback =>
  socketManager.on(CHAT_EVENTS.CHATS_LIST, callback);
export const listenToNewMessage = callback =>
  socketManager.on(CHAT_EVENTS.NEW_MESSAGE, callback);
export const listenToMessageHistory = callback =>
  socketManager.on(CHAT_EVENTS.MESSAGE_HISTORY, callback);
export const listenToMessageRead = callback =>
  socketManager.on(CHAT_EVENTS.MESSAGE_READ, callback);
export const listenToMessageDeleted = callback =>
  socketManager.on(CHAT_EVENTS.MESSAGE_DELETED, callback);
export const listenToChatDeleted = callback =>
  socketManager.on(CHAT_EVENTS.CHAT_DELETED, callback);
export const listenToChatError = callback =>
  socketManager.on(CHAT_EVENTS.ERROR, callback);

/** --------- CLUB LISTENERS --------- */
export const listenToClubCreated = callback =>
  socketManager.on(CLUB_EVENTS.CLUB_CREATED, callback);
export const listenToClubDeleted = callback =>
  socketManager.on(CLUB_EVENTS.CLUB_DELETED, callback);
export const listenToClubJoined = callback =>
  socketManager.on(CLUB_EVENTS.CLUB_JOINED, callback);
export const listenToClubLeft = callback =>
  socketManager.on(CLUB_EVENTS.CLUB_LEFT, callback);
export const listenToClubMembers = callback =>
  socketManager.on(CLUB_EVENTS.CLUB_MEMBERS, callback);
export const listenToAllClubs = callback =>
  socketManager.on(CLUB_EVENTS.ALL_CLUBS, callback);
export const listenToNewClubMessage = callback =>
  socketManager.on(CLUB_EVENTS.NEW_MESSAGE, callback);
export const listenToClubMessageHistory = callback =>
  socketManager.on(CLUB_EVENTS.MESSAGE_HISTORY, callback);
export const listenToClubMessageDeleted = callback =>
  socketManager.on(CLUB_EVENTS.MESSAGE_DELETED, callback);
export const listenToMemberKicked = callback =>
  socketManager.on(CLUB_EVENTS.MEMBER_KICKED, callback);
export const listenToMemberBanned = callback =>
  socketManager.on(CLUB_EVENTS.MEMBER_BANNED, callback);
export const listenToMemberMuted = callback =>
  socketManager.on(CLUB_EVENTS.MEMBER_MUTED, callback);
export const listenToClubError = callback =>
  socketManager.on(CLUB_EVENTS.ERROR, callback);

/**
 * ================================================
 *  CLEANUP HELPERS (Remove listeners)
 * ================================================
 */

// CHAT
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

// CLUB
export const removeClubCreatedListener = () =>
  socketManager.off(CLUB_EVENTS.CLUB_CREATED);
export const removeClubDeletedListener = () =>
  socketManager.off(CLUB_EVENTS.CLUB_DELETED);
export const removeClubJoinedListener = () =>
  socketManager.off(CLUB_EVENTS.CLUB_JOINED);
export const removeClubLeftListener = () =>
  socketManager.off(CLUB_EVENTS.CLUB_LEFT);
export const removeClubMembersListener = () =>
  socketManager.off(CLUB_EVENTS.CLUB_MEMBERS);
export const removeAllClubsListener = () =>
  socketManager.off(CLUB_EVENTS.ALL_CLUBS);
export const removeNewClubMessageListener = () =>
  socketManager.off(CLUB_EVENTS.NEW_MESSAGE);
export const removeClubMessageHistoryListener = () =>
  socketManager.off(CLUB_EVENTS.MESSAGE_HISTORY);
export const removeClubMessageDeletedListener = () =>
  socketManager.off(CLUB_EVENTS.MESSAGE_DELETED);
export const removeMemberKickedListener = () =>
  socketManager.off(CLUB_EVENTS.MEMBER_KICKED);
export const removeMemberBannedListener = () =>
  socketManager.off(CLUB_EVENTS.MEMBER_BANNED);
export const removeMemberMutedListener = () =>
  socketManager.off(CLUB_EVENTS.MEMBER_MUTED);
export const removeClubErrorListener = () =>
  socketManager.off(CLUB_EVENTS.ERROR);
