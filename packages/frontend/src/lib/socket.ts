import { io, Socket } from 'socket.io-client';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('accessToken');
    socket = io(WS_URL, { auth: { token }, transports: ['websocket'], autoConnect: false });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) { s.auth = { token: localStorage.getItem('accessToken') }; s.connect(); }
}

export function disconnectSocket(): void {
  if (socket) { socket.disconnect(); socket = null; }
}
