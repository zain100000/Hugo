import {io} from 'socket.io-client';
import CONFIG from './config/Config';

const {BASE_URL} = CONFIG;

console.log('Socket BASE_URL:', BASE_URL);

let socket = null;

export const initializeSocket = token => {
  if (socket) return socket;

  socket = io(BASE_URL, {
    transports: ['websocket'],
    query: {token},
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', err => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('disconnect', reason => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;
