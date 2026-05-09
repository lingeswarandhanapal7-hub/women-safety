const mongoose = require('mongoose')

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  score: { type: Number, min: 0, max: 100 },
  factors: {
    routineDeviation: { type: Number, default: 0 },
    locationRisk: { type: Number, default: 0 },
    timeRisk: { type: Number, default: 0 },
    recentAlerts: { type: Number, default: 0 }
  },
  recommendation: String
}, { timestamps: true })

module.exports = mongoose.model('SafetyScore', scoreSchema)
