const CommunityReport = require('../models/CommunityReport')

exports.getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm = 1 } = req.query
    const reports = await CommunityReport.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [+lng, +lat] },
          $maxDistance: radiusKm * 1000
        }
      }
    }).limit(50)
    res.json({ success: true, reports })
  } catch (err) { next(err) }
}

exports.createReport = async (req, res, next) => {
  try {
    const { lat, lng, address, type, description } = req.body
    const report = await CommunityReport.create({
      reporterId: req.user._id,
      location: { type: 'Point', coordinates: [lng, lat], address },
      type, description
    })
    res.status(201).json({ success: true, report })
  } catch (err) { next(err) }
}

exports.getHeatmap = async (req, res, next) => {
  try {
    const reports = await CommunityReport.find({}).limit(500)
    const geojson = {
      type: 'FeatureCollection',
      features: reports.map(r => ({
        type: 'Feature',
        geometry: r.location,
        properties: { type: r.type, description: r.description, upvotes: r.upvotes }
      }))
    }
    res.json({ success: true, geojson, reports })
  } catch (err) { next(err) }
}

exports.upvote = async (req, res, next) => {
  try {
    const report = await CommunityReport.findByIdAndUpdate(
      req.params.id, { $inc: { upvotes: 1 } }, { new: true }
    )
    res.json({ success: true, report })
  } catch (err) { next(err) }
}
