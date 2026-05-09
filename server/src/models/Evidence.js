const mongoose = require('mongoose')

const evidenceSchema = new mongoose.Schema({
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{
    url: String,
    cloudinaryId: String,
    type: { type: String, enum: ['audio', 'video', 'image'] },
    sizeBytes: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  locationHistory: [{ lat: Number, lng: Number, timestamp: Date }],
  reportGenerated: { type: Boolean, default: false },
  reportUrl: String,
  canDelete: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Evidence', evidenceSchema)
