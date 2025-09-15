const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

/**
 * @function initializeSocket
 * @description Initializes and configures the Socket.IO server with JWT authentication middleware.
 * @param {import("http").Server} server - The HTTP server instance to bind Socket.IO to.
 * @returns {Server} - The initialized Socket.IO server instance.
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // change later to specific origin for production
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  /**
   * @middleware JWT Authentication Middleware
   */
  io.use((socket, next) => {
    try {
      console.log(`[Handshake attempt] socketId=${socket.id}`);
      console.log("Auth:", socket.handshake.auth);
      console.log("Query:", socket.handshake.query);

      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        console.error(`[Socket ${socket.id}] Missing authentication token`);
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.user?.id || !decoded?.role) {
        console.error(`[Socket ${socket.id}] Invalid token structure`);
        return next(new Error("Authentication error: Invalid token structure"));
      }

      socket.user = {
        id: decoded.user.id,
        role: decoded.role,
        email: decoded.user.email || null,
      };

      console.log(
        `[Socket ${socket.id}] Authenticated as ${socket.user.id} (${socket.user.role})`
      );
      return next();
    } catch (error) {
      console.error(
        `[Socket ${socket.id}] Authentication failed: ${error.message}`
      );
      return next(new Error("Authentication failed: " + error.message));
    }
  });

  /**
   * @event connection
   */
  io.on("connection", (socket) => {
    console.log(
      `[Socket ${socket.id}] User ${socket.user?.id} connected as ${socket.user?.role}`
    );

    if (socket.user?.id) {
      socket.join(socket.user.id);
      console.log(
        `[Socket ${socket.id}] Joined personal room ${socket.user.id}`
      );
    }

    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket ${socket.id}] User ${socket.user?.id} disconnected (Reason: ${reason})`
      );
    });

    socket.on("error", (error) => {
      console.error(
        `[Socket ${socket.id}] Error for user ${socket.user?.id}:`,
        error
      );
    });
  });

  return io;
};

/**
 * @function getIo
 */
const getIo = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

module.exports = { initializeSocket, getIo };
