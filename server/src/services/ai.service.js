const axios = require('axios')

async function analyzeVoiceForDistress(audioBase64) {
  try {
    const buffer = Buffer.from(audioBase64, 'base64')
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition',
      buffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'audio/wav'
        },
        timeout: 10000
      }
    )
    const results = response.data
    const distressEmotions = ['fear', 'angry', 'disgust']
    const distressScore = results
      .filter(r => distressEmotions.some(e => r.label?.toLowerCase().includes(e)))
      .reduce((sum, r) => sum + r.score, 0)
    return {
      distressScore,
      emotion: results[0]?.label || 'neutral',
      shouldTrigger: distressScore > 0.75
    }
  } catch (err) {
    console.error('HuggingFace API error:', err.message)
    return { distressScore: 0, emotion: 'unknown', shouldTrigger: false }
  }
}

async function analyzeBehaviorRisk(user, lat, lng, timestamp) {
  const now = new Date(timestamp)
  const dayOfWeek = now.getDay()
  const hour = now.getHours()
  let riskScore = 20

  const todayPattern = user.routinePatterns?.find(p => p.dayOfWeek === dayOfWeek)
  if (todayPattern) {
    const dist = haversine(lat, lng, todayPattern.expectedLat, todayPattern.expectedLng)
    if (dist > 2000) riskScore += 30
    else if (dist > 1000) riskScore += 15
  }

  if (hour >= 22 || hour <= 5) riskScore += 25
  else if (hour >= 20 || hour <= 7) riskScore += 10

  riskScore = Math.min(100, riskScore)
  const recommendation =
    riskScore > 70 ? 'High risk detected. Share your location with a trusted contact.' :
    riskScore > 40 ? 'Moderate risk. Stay in well-lit areas.' :
    'You appear to be following your normal routine. Stay aware.'

  return { riskScore, recommendation, deviation: riskScore > 30 }
}

async function detectShadowPattern(locationHistory) {
  if (!locationHistory || locationHistory.length < 5) {
    return { followingDetected: false, confidence: 0 }
  }
  let reversals = 0
  for (let i = 2; i < locationHistory.length; i++) {
    const d1 = bearing(locationHistory[i - 2], locationHistory[i - 1])
    const d2 = bearing(locationHistory[i - 1], locationHistory[i])
    if (Math.abs(d1 - d2) > 150) reversals++
  }
  const confidence = Math.min(1, reversals / locationHistory.length * 2)
  return { followingDetected: confidence > 0.65, confidence: parseFloat(confidence.toFixed(2)) }
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function bearing(p1, p2) {
  const lat1 = p1.lat * Math.PI / 180, lat2 = p2.lat * Math.PI / 180
  const dLng = (p2.lng - p1.lng) * Math.PI / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return Math.atan2(y, x) * 180 / Math.PI
}

module.exports = { analyzeVoiceForDistress, analyzeBehaviorRisk, detectShadowPattern }
