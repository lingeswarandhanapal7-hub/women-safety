import { create } from 'zustand'
import { io } from 'socket.io-client'
import useAlertStore from './useAlertStore'

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  init: (token) => {
    const existing = get().socket
    if (existing?.connected) return

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      set({ isConnected: true })
      console.log('🔌 Socket connected')
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    socket.on('alert:new', (data) => {
      useAlertStore.getState().fetchActive()
    })

    socket.on('alert:escalated', (data) => {
      useAlertStore.setState({ alertLevel: data.newLevel })
    })

    socket.on('alert:resolved', () => {
      useAlertStore.setState({ activeAlert: null, alertLevel: null })
    })

    socket.on('checkin:prompt', (data) => {
      if (Notification.permission === 'granted') {
        new Notification('SHEild Safety Check', {
          body: data.message,
          icon: '/shield.png'
        })
      }
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) socket.disconnect()
    set({ socket: null, isConnected: false })
  },

  emit: (event, data) => {
    const { socket } = get()
    if (socket?.connected) socket.emit(event, data)
  }
}))

export default useSocketStore
