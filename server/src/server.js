require('dotenv').config()
const http = require('http')
const app = require('./app')
const { connectDB } = require('./config/db')
const { initSocket } = require('./config/socket')
const { startEscalationService } = require('./services/escalation.service')

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  const server = http.createServer(app)
  initSocket(server)
  startEscalationService()
  server.listen(PORT, () => {
    console.log(`🛡️  SHEild API running on port ${PORT}`)
    console.log(`📡 Environment: ${process.env.NODE_ENV}`)
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`)
  })
}

start().catch(err => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
