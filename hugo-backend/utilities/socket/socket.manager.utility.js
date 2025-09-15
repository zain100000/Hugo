/**
 * @module activeUsers
 * @description Maintains an in-memory mapping of active users (userId → socketId).
 * Useful for direct messaging, presence tracking, or notifications.
 */

/**
 * @constant {Map<string, string>}
 * @description Map of active users where:
 * - key = userId (string from database / JWT)
 * - value = socketId (unique identifier from socket.io)
 */
const activeUsers = new Map();

module.exports = { activeUsers };
