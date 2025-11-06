import { io } from 'socket.io-client'
import { API_BASE_URL } from '@/config/api'

let socket

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}
