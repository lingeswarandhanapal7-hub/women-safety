const axios = require('axios')
const Route = require('../models/Route')

exports.getSafeRoute = async (req, res, next) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.body

    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/` +
      `${originLng},${originLat};${destLng},${destLat}?geometries=geojson&steps=true`

    const { data } = await axios.get(osrmUrl, { timeout: 8000 })
    const coords = data.routes[0]?.geometry?.coordinates || []

    const hour = new Date().getHours()
    const isNight = hour >= 21 || hour <= 5

    const path = coords.map(([lng, lat]) => {
      const lightingScore = isNight ? 30 + Math.random() * 40 : 70 + Math.random() * 30
      const crimeScore = 50 + Math.random() * 50
      const crowdScore = isNight ? 20 + Math.random() * 40 : 50 + Math.random() * 50
      const safetyScore = Math.round((lightingScore + crimeScore + crowdScore) / 3)
      return {
        lat, lng, safetyScore,
        riskType: safetyScore < 40 ? 'high_risk' : safetyScore < 70 ? 'moderate' : 'safe'
      }
    })

    const totalRating = path.length > 0
      ? Math.round(path.reduce((s, p) => s + p.safetyScore, 0) / path.length)
      : 50

    const route = await Route.create({
      userId: req.user._id,
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destLat, lng: destLng },
      path,
      crimeScore: Math.round(50 + Math.random() * 50),
      lightingScore: Math.round(isNight ? 30 : 70 + Math.random() * 30),
      crowdScore: Math.round(40 + Math.random() * 60),
      totalRating,
      distanceMeters: Math.round(data.routes[0]?.distance || 0),
      estimatedMinutes: Math.round((data.routes[0]?.duration || 0) / 60)
    })

    res.json({ success: true, route })
  } catch (err) { next(err) }
}

exports.getHistory = async (req, res, next) => {
  try {
    const routes = await Route.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10)
    res.json({ success: true, routes })
  } catch (err) { next(err) }
}
