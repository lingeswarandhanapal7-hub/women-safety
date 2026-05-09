const mongoose = require('mongoose')

const checkInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledAt: Date,
  respondedAt: Date,
  status: { type: String, enum: ['pending', 'safe', 'missed', 'escalated'], default: 'pending' },
  alertTriggered: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('CheckIn', checkInSchema)
