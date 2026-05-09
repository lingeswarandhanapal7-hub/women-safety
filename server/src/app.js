require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const { generalLimiter } = require('./middleware/rateLimit')
const errorHandler = require('./middleware/error')

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('combined'))
app.use(generalLimiter)

app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/alerts',    require('./routes/alert.routes'))
app.use('/api/safety',    require('./routes/safety.routes'))
app.use('/api/routes',    require('./routes/route.routes'))
app.use('/api/evidence',  require('./routes/evidence.routes'))
app.use('/api/community', require('./routes/community.routes'))
app.use('/api/checkin',   require('./routes/checkin.routes'))
app.use('/api/wearable',  require('./routes/wearable.routes'))

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose')
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

app.use(errorHandler)
module.exports = app
