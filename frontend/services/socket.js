import { io } from 'socket.io-client';

// Use same origin as frontend (works on any port, proxied by Next.js to backend)
const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      path: '/socket.io',
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};

export default getSocket;
