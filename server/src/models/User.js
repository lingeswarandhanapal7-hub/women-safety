const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  trustedContacts: [{
    name: String,
    phone: String,
    email: String,
    notifyOnLevel: { type: Number, default: 1 }
  }],
  homeLocation: { lat: Number, lng: Number, address: String },
  routinePatterns: [{
    dayOfWeek: Number,
    expectedLat: Number,
    expectedLng: Number,
    expectedTime: String,
    radiusMeters: { type: Number, default: 500 }
  }],
  safetyScore: { type: Number, default: 75 },
  wearableDeviceId: String,
  isVerifiedCommunityMember: { type: Boolean, default: false },
  refreshToken: String,
  demoMode: { type: Boolean, default: false }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  next()
})

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)
