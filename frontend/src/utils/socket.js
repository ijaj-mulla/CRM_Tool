import { io } from 'socket.io-client'

let socket

export function getSocket() {
  if (!socket) {
    socket = io('http://localhost:5000', {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}
