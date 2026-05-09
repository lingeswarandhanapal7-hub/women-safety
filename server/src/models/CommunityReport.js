const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    address: String
  },
  type: { type: String, enum: ['unsafe_area', 'harassment', 'well_lit', 'safe_zone', 'crowd_alert'] },
  description: String,
  upvotes: { type: Number, default: 0 }
}, { timestamps: true })

reportSchema.index({ location: '2dsphere' })
module.exports = mongoose.model('CommunityReport', reportSchema)
