const mongoose = require('mongoose')

const routeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  origin: { lat: Number, lng: Number, address: String },
  destination: { lat: Number, lng: Number, address: String },
  path: [{ lat: Number, lng: Number, safetyScore: Number, riskType: String }],
  crimeScore: Number,
  lightingScore: Number,
  crowdScore: Number,
  totalRating: Number,
  distanceMeters: Number,
  estimatedMinutes: Number
}, { timestamps: true })

module.exports = mongoose.model('Route', routeSchema)
