const Alert = require('../models/Alert')
const User = require('../models/User')
const { sendEmergencySMS, makeEmergencyCall } = require('../services/twilio.service')
const { getIO } = require('../config/socket')

exports.trigger = async (req, res, next) => {
  try {
    const { level = 1, triggerType = 'manual', lat, lng, address } = req.body
    const user = await User.findById(req.user._id)

    const alert = await Alert.create({
      userId: user._id,
      level,
      triggerType,
      location: {
        lat, lng, address,
        type: 'Point',
        coordinates: lng && lat ? [lng, lat] : []
      },
      autoEscalateAt: new Date(Date.now() + 5 * 60 * 1000),
      escalationHistory: [{ level, action: `Level ${level} triggered via ${triggerType}`, triggeredBy: triggerType }]
    })

    const io = getIO()
    const notifiedContacts = []

    for (const contact of user.trustedContacts || []) {
      if (contact.notifyOnLevel <= level) {
        const sent = await sendEmergencySMS(contact, alert, user)
        if (sent) notifiedContacts.push(contact.phone)
        if (level >= 2) await makeEmergencyCall(contact, user)
      }
    }

    await Alert.findByIdAndUpdate(alert._id, { notifiedContacts })

    io.to(`user:${user._id}`).emit('alert:new', {
      alertId: alert._id, level, userId: user._id,
      location: alert.location, triggerType
    })

    if (level === 3) {
      io.emit('community:nearby', {
        alertId: alert._id, lat, lng, message: 'Someone nearby needs help — Level 3'
      })
    }

    res.status(201).json({ success: true, alert, notifiedCount: notifiedContacts.length })
  } catch (err) { next(err) }
}

exports.escalate = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user._id, status: 'active' })
    if (!alert) return res.status(404).json({ success: false, error: 'Active alert not found' })
    if (alert.level >= 3) return res.status(400).json({ success: false, error: 'Already at max level' })

    const newLevel = alert.level + 1
    alert.level = newLevel
    alert.autoEscalateAt = new Date(Date.now() + 5 * 60 * 1000)
    alert.escalationHistory.push({ level: newLevel, action: `Escalated to Level ${newLevel}`, triggeredBy: 'user' })
    await alert.save()

    const user = await User.findById(req.user._id)
    const io = getIO()

    for (const contact of user.trustedContacts || []) {
      if (contact.notifyOnLevel <= newLevel) {
        await sendEmergencySMS(contact, alert, user)
        if (newLevel >= 3) await makeEmergencyCall(contact, user)
      }
    }

    io.to(`user:${req.user._id}`).emit('alert:escalated', {
      alertId: alert._id, newLevel, action: `Level ${newLevel} — escalated by user`
    })

    if (newLevel === 3) {
      io.emit('community:nearby', {
        alertId: alert._id, lat: alert.location?.lat, lng: alert.location?.lng,
        message: 'Level 3 Emergency — someone nearby needs immediate help'
      })
    }

    res.json({ success: true, alert })
  } catch (err) { next(err) }
}

exports.resolve = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    )
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' })
    getIO().to(`user:${req.user._id}`).emit('alert:resolved', { alertId: alert._id })
    res.json({ success: true, alert })
  } catch (err) { next(err) }
}

exports.silentTrigger = async (req, res, next) => {
  try {
    const { audioBase64, lat, lng } = req.body
    const { analyzeVoiceForDistress } = require('../services/ai.service')
    const result = await analyzeVoiceForDistress(audioBase64)
    if (result.shouldTrigger) {
      req.body = { level: 1, triggerType: 'voice', lat, lng }
      return exports.trigger(req, res, next)
    }
    res.json({ success: true, shouldTrigger: false, ...result })
  } catch (err) { next(err) }
}

exports.getActive = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({ userId: req.user._id, status: 'active' }).sort({ createdAt: -1 })
    res.json({ success: true, alert })
  } catch (err) { next(err) }
}

exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit
    const [alerts, total] = await Promise.all([
      Alert.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(+limit),
      Alert.countDocuments({ userId: req.user._id })
    ])
    res.json({ success: true, alerts, total, page: +page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}
