// 📦 SocketManager.js
import {getSocket} from './Socket.utility';

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  initialize() {
    this.socket = getSocket();
    if (!this.socket) {
      console.warn('Socket not available during initialization');
    }
  }

  isConnected() {
    this.socket = getSocket(); // Always get latest
    return this.socket?.connected;
  }

  emit(event, data, ackCallback) {
    this.socket = getSocket();
    if (!this.socket) {
      console.warn(`Socket not initialized - cannot emit ${event}`);
      return false;
    }

    if (!this.isConnected()) {
      console.warn(`Socket not connected - cannot emit ${event}`);
      return false;
    }

    console.log(`📤 Emitting [${event}]:`, data);
    this.socket.emit(event, data, ackCallback);
    return true;
  }

  on(event, callback) {
    this.socket = getSocket();
    if (!this.socket) {
      console.warn(`Socket not initialized - cannot listen to ${event}`);
      return false;
    }

    this.off(event); // Remove existing listener first
    this.socket.on(event, callback);
    this.listeners.set(event, callback);
    console.log(`👂 Listening to [${event}]`);
    return true;
  }

  off(event) {
    this.socket = getSocket();
    if (!this.socket) return;

    const callback = this.listeners.get(event);
    if (callback) {
      this.socket.off(event, callback);
      this.listeners.delete(event);
      console.log(`🚫 Listener removed for [${event}]`);
    }
  }

  offAll() {
    this.socket = getSocket();
    if (!this.socket) return;

    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback);
    });
    this.listeners.clear();
    console.log('🧹 All listeners removed');
  }

  disconnect() {
    this.offAll();
    if (this.socket) {
      this.socket.disconnect();
      console.log('🛑 Socket disconnected manually');
      this.socket = null;
    }
  }
}

const socketManager = new SocketManager();
export default socketManager;
