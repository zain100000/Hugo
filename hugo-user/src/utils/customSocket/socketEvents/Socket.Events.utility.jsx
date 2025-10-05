// ========================================
// 🔹 CHAT SOCKET EVENTS
// ========================================
export const CHAT_EVENTS = {
  // Client → Server
  CREATE_CHAT: 'createChat',
  GET_CHATS: 'getChats',
  GET_MESSAGE_HISTORY: 'getMessageHistory',
  SEND_MESSAGE: 'sendMessage',
  MARK_AS_READ: 'markAsRead',
  DELETE_MESSAGE: 'deleteMessage',
  DELETE_CHAT: 'deleteChat',

  // Server → Client
  CHAT_CREATED: 'chatCreated',
  CHATS_LIST: 'chatsList',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_HISTORY: 'messageHistory',
  MESSAGE_READ: 'messageRead',
  MESSAGE_DELETED: 'messageDeleted',
  CHAT_DELETED: 'chatDeleted',
  ERROR: 'error',
};

// ========================================
// 🔹 CLUB SOCKET EVENTS
// ========================================
export const CLUB_EVENTS = {
  // Client → Server
  CREATE_CLUB: 'createClub',
  DELETE_CLUB: 'deleteClub',
  GET_CLUB_MEMBERS: 'getClubMembers',
  GET_ALL_CLUBS: 'getAllClubs',
  GET_MESSAGE_HISTORY: 'getMessageHistory',
  DELETE_MESSAGE: 'deleteMessage',
  KICK_MEMBER: 'kickMember',
  BAN_MEMBER: 'banMember',
  MUTE_MEMBER: 'muteMember',
  JOIN_CLUB: 'joinClub',
  LEAVE_CLUB: 'leaveClub',
  SEND_MESSAGE: 'sendMessage',

  // Server → Client
  CLUB_CREATED: 'clubCreated',
  CLUB_DELETED: 'clubDeleted',
  CLUB_JOINED: 'clubJoined',
  CLUB_LEFT: 'clubLeft',
  CLUB_MEMBERS: 'clubMembers',
  ALL_CLUBS: 'allClubs',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_HISTORY: 'messageHistory',
  MESSAGE_DELETED: 'messageDeleted',
  MEMBER_KICKED: 'memberKicked',
  MEMBER_BANNED: 'memberBanned',
  MEMBER_MUTED: 'memberMuted',
  ERROR: 'error',
};
