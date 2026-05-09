const User = require('../models/User')

exports.connect = async (req, res, next) => {
  try {
    const { deviceId } = req.body
    await User.findByIdAndUpdate(req.user._id, { wearableDeviceId: deviceId })
    res.json({ success: true, message: 'Wearable connected' })
  } catch (err) { next(err) }
}

exports.trigger = async (req, res, next) => {
  try {
    req.body = { level: 1, triggerType: 'wearable', lat: req.body.lat, lng: req.body.lng }
    return require('./alert.controller').trigger(req, res, next)
  } catch (err) { next(err) }
}

exports.heartrate = async (req, res, next) => {
  try {
    const { bpm, lat, lng } = req.body
    if (bpm > 150) {
      req.body = { level: 1, triggerType: 'wearable', lat, lng }
      return require('./alert.controller').trigger(req, res, next)
    }
    res.json({ success: true, bpm, status: bpm > 120 ? 'elevated' : 'normal' })
  } catch (err) { next(err) }
}
