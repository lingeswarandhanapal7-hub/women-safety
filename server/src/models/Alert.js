const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: Number, enum: [1, 2, 3], required: true },
  triggerType: {
    type: String,
    enum: ['voice', 'motion', 'manual', 'wearable', 'ai_behavior', 'checkin_missed', 'shadow_detection'],
    default: 'manual'
  },
  location: {
    lat: Number, lng: Number, address: String,
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  audioUrl: String,
  videoUrl: String,
  status: { type: String, enum: ['active', 'resolved', 'false_alarm'], default: 'active' },
  notifiedContacts: [String],
  nearbyUsersAlerted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  escalationHistory: [{
    level: Number,
    timestamp: { type: Date, default: Date.now },
    action: String,
    triggeredBy: { type: String, default: 'user' }
  }],
  autoEscalateAt: Date,
  resolvedAt: Date
}, { timestamps: true })

alertSchema.index({ location: '2dsphere' })
alertSchema.index({ userId: 1, status: 1 })

module.exports = mongoose.model('Alert', alertSchema)
