const SafetyScore = require('../models/SafetyScore')
const { analyzeBehaviorRisk, detectShadowPattern } = require('../services/ai.service')

exports.getScore = async (req, res, next) => {
  try {
    let score = await SafetyScore.findOne({ userId: req.user._id }).sort({ createdAt: -1 })
    if (!score) {
      score = await SafetyScore.create({
        userId: req.user._id, score: 75,
        factors: { routineDeviation: 10, locationRisk: 10, timeRisk: 5, recentAlerts: 0 },
        recommendation: 'You are safe. SHEild is monitoring your routine.'
      })
    }
    res.json({ success: true, score })
  } catch (err) { next(err) }
}

exports.getHistory = async (req, res, next) => {
  try {
    const scores = await SafetyScore.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30)
    res.json({ success: true, scores })
  } catch (err) { next(err) }
}

exports.analyze = async (req, res, next) => {
  try {
    const { lat, lng, timestamp } = req.body
    const result = await analyzeBehaviorRisk(req.user, lat, lng, timestamp || Date.now())
    const scoreValue = 100 - result.riskScore
    const newScore = await SafetyScore.create({
      userId: req.user._id,
      score: scoreValue,
      factors: {
        routineDeviation: result.riskScore > 30 ? 40 : 10,
        locationRisk: result.riskScore > 50 ? 30 : 10,
        timeRisk: result.riskScore > 40 ? 20 : 5,
        recentAlerts: 0
      },
      recommendation: result.recommendation
    })
    await require('../models/User').findByIdAndUpdate(req.user._id, { safetyScore: scoreValue })
    res.json({ success: true, score: newScore, riskScore: result.riskScore, recommendation: result.recommendation })
  } catch (err) { next(err) }
}

exports.detectShadow = async (req, res, next) => {
  try {
    const { locationHistory } = req.body
    const result = await detectShadowPattern(locationHistory)
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}
