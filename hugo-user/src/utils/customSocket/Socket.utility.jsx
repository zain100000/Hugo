// 📦 Socket.js
import {io} from 'socket.io-client';
import {AppState} from 'react-native';
import CONFIG from './config/Config';

const {BASE_URL} = CONFIG;
let socket = null;
let currentToken = null;
let appState = AppState.currentState;

console.log('🔌 Socket BASE_URL:', BASE_URL);

export const initializeSocket = token => {
  if (socket && socket.connected) {
    console.log('⚡ Socket already connected:', socket.id);
    return socket;
  }

  currentToken = token;

  socket = io(BASE_URL, {
    transports: ['websocket'],
    auth: {token},
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 15000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', err => {
    console.error('❌ Socket connection error:', err.message);
  });

  socket.on('disconnect', reason => {
    console.warn('⚠️ Socket disconnected:', reason);
  });

  // Reconnect socket when app comes to foreground
  AppState.addEventListener('change', handleAppStateChange);

  return socket;
};

export const getSocket = () => {
  return socket;
};

const handleAppStateChange = nextAppState => {
  if (appState.match(/inactive|background/) && nextAppState === 'active') {
    console.log('🔄 App resumed — checking socket connection...');
    if (!socket?.connected && currentToken) {
      console.log('🔄 Reconnecting socket...');
      initializeSocket(currentToken);
    }
  }

  appState = nextAppState;
};
