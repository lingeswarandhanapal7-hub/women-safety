const CheckIn = require('../models/CheckIn')
const { getIO } = require('../config/socket')

exports.schedule = async (req, res, next) => {
  try {
    const { delayMinutes = 30 } = req.body
    const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000)
    const checkIn = await CheckIn.create({ userId: req.user._id, scheduledAt })
    const delay = scheduledAt - Date.now()
    setTimeout(async () => {
      const current = await CheckIn.findById(checkIn._id)
      if (current?.status === 'pending') {
        getIO().to(`user:${req.user._id}`).emit('checkin:prompt', {
          checkInId: checkIn._id,
          message: 'Are you safe? Please confirm.',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        })
      }
    }, delay)
    res.status(201).json({ success: true, checkIn })
  } catch (err) { next(err) }
}

exports.respond = async (req, res, next) => {
  try {
    const { status } = req.body
    const checkIn = await CheckIn.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status, respondedAt: new Date() },
      { new: true }
    )
    if (!checkIn) return res.status(404).json({ success: false, error: 'Check-in not found' })
    res.json({ success: true, checkIn })
  } catch (err) { next(err) }
}

exports.getPending = async (req, res, next) => {
  try {
    const checkIns = await CheckIn.find({ userId: req.user._id, status: 'pending' })
    res.json({ success: true, checkIns })
  } catch (err) { next(err) }
}

exports.getHistory = async (req, res, next) => {
  try {
    const checkIns = await CheckIn.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20)
    res.json({ success: true, checkIns })
  } catch (err) { next(err) }
}
