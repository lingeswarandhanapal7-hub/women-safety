const User = require('../models/User')
const jwt = require('jsonwebtoken')

function generateTokens(userId) {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' })
    const user = await User.create({ name, email, phone, passwordHash: password })
    const { accessToken, refreshToken } = generateTokens(user._id)
    await User.findByIdAndUpdate(user._id, { refreshToken })
    res.status(201).json({
      success: true, accessToken, refreshToken,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    })
  } catch (err) { next(err) }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' })
    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' })
    const { accessToken, refreshToken } = generateTokens(user._id)
    await User.findByIdAndUpdate(user._id, { refreshToken })
    res.json({
      success: true, accessToken, refreshToken,
      user: {
        id: user._id, name: user.name, email: user.email, phone: user.phone,
        safetyScore: user.safetyScore, trustedContacts: user.trustedContacts
      }
    })
  } catch (err) { next(err) }
}

exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
    res.json({ success: true })
  } catch (err) { next(err) }
}

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' })
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' })
    }
    const { accessToken, refreshToken: newRefresh } = generateTokens(user._id)
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefresh })
    res.json({ success: true, accessToken, refreshToken: newRefresh })
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token expired or invalid' })
  }
}

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user })
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { trustedContacts, homeLocation, name, phone } = req.body
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { trustedContacts, homeLocation, name, phone },
      { new: true }
    ).select('-passwordHash -refreshToken')
    res.json({ success: true, user: updated })
  } catch (err) { next(err) }
}
