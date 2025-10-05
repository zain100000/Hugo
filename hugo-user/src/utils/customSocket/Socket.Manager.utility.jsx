// ================================================
// 📦 Socket.Manager.utility.js
// ================================================
import io from 'socket.io-client';

// ✅ Replace this with your backend WebSocket URL
const SOCKET_URL = 'ws://192.168.1.4:8000'; // use your actual IP

class SocketManager {
  constructor() {
    this.socket = null;
  }

  /**
   * 🔹 Initialize Socket Connection
   */
  initialize(token) {
    if (this.socket && this.socket.connected) {
      console.log('⚡ Socket already connected:', this.socket.id);
      return;
    }

    console.log('🛰️ Connecting socket to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      query: {
        token, // Optional: send user token if needed for auth
      },
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', error => {
      console.log('⚠️ Socket connection error:', error.message);
    });
  }

  /**
   * 🔹 Check if socket is connected
   */
  isConnected() {
    return this.socket && this.socket.connected;
  }

  /**
   * 🔹 Emit an event
   */
  emit(event, data) {
    if (this.isConnected()) {
      console.log(`📤 Emitting [${event}]:`, data);
      this.socket.emit(event, data);
    } else {
      console.log(`⚠️ Cannot emit [${event}] — socket not connected`);
    }
  }

  /**
   * 🔹 Listen to an event
   */
  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
    console.log(`👂 Listening to [${event}]`);
  }

  /**
   * 🔹 Remove a listener
   */
  off(event) {
    if (!this.socket) return;
    this.socket.off(event);
    console.log(`🚫 Listener removed for [${event}]`);
  }

  /**
   * 🔹 Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🛑 Socket disconnected manually');
      this.socket = null;
    }
  }
}

const socketManager = new SocketManager();
export default socketManager;
