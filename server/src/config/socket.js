const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
let io

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true }
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`)
    console.log(`🔌 Socket connected: ${socket.userId}`)

    socket.on('location:update', (data) => {
      socket.to(`alert:${data.alertId}`).emit('tracking:update', {
        lat: data.lat, lng: data.lng, timestamp: data.timestamp
      })
    })

    socket.on('user:join', ({ userId }) => {
      socket.join(`user:${userId}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userId}`)
    })
  })

  return io
}

function getIO() {
  if (!io) throw new Error('Socket not initialized')
  return io
}

module.exports = { initSocket, getIO }
