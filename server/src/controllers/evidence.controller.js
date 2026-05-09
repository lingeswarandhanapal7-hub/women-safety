const Evidence = require('../models/Evidence')
const Alert = require('../models/Alert')
const { uploadToCloudinary } = require('../middleware/upload')

exports.upload = async (req, res, next) => {
  try {
    const { alertId, type = 'video', locationHistory } = req.body
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: type === 'audio' ? 'raw' : 'video',
      folder: `sheild-evidence/${alertId}`
    })

    let evidence = await Evidence.findOne({ alertId, userId: req.user._id })
    if (!evidence) {
      evidence = await Evidence.create({ alertId, userId: req.user._id, files: [], canDelete: false })
    }

    evidence.files.push({
      url: result.secure_url,
      cloudinaryId: result.public_id,
      type,
      sizeBytes: result.bytes
    })

    if (locationHistory) {
      try { evidence.locationHistory = JSON.parse(locationHistory) } catch {}
    }
    await evidence.save()

    res.json({ success: true, evidence, fileUrl: result.secure_url })
  } catch (err) { next(err) }
}

exports.getByAlert = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({ alertId: req.params.alertId, userId: req.user._id })
    res.json({ success: true, evidence })
  } catch (err) { next(err) }
}

exports.generateReport = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({ alertId: req.params.alertId, userId: req.user._id })
    if (!evidence) return res.status(404).json({ success: false, error: 'No evidence found' })

    const alert = await Alert.findById(req.params.alertId)
    const reportText =
      `SHEILD SAFETY INCIDENT REPORT\n` +
      `${'='.repeat(50)}\n` +
      `Generated: ${new Date().toISOString()}\n` +
      `Alert ID: ${alert._id}\n` +
      `Level: ${alert.level}\n` +
      `Trigger: ${alert.triggerType}\n` +
      `Status: ${alert.status}\n` +
      `Location: ${alert.location?.lat}, ${alert.location?.lng}\n` +
      `Address: ${alert.location?.address || 'Unknown'}\n` +
      `Time: ${alert.createdAt}\n` +
      `${'='.repeat(50)}\n` +
      `Evidence files: ${evidence.files.length}\n` +
      evidence.files.map(f => `  [${f.type.toUpperCase()}] ${f.url} (${Math.round(f.sizeBytes / 1024)}KB)`).join('\n') +
      `\n\nLocation History (${evidence.locationHistory.length} points):\n` +
      evidence.locationHistory.map(l =>
        `  ${new Date(l.timestamp).toISOString()} — ${l.lat.toFixed(5)}, ${l.lng.toFixed(5)}`
      ).join('\n')

    const buffer = Buffer.from(reportText, 'utf-8')
    const uploadResult = await uploadToCloudinary(buffer, {
      resource_type: 'raw',
      format: 'txt',
      public_id: `sheild-reports/${req.params.alertId}-report`
    })

    evidence.reportGenerated = true
    evidence.reportUrl = uploadResult.secure_url
    await evidence.save()

    res.json({ success: true, reportUrl: uploadResult.secure_url })
  } catch (err) { next(err) }
}

exports.deleteEvidence = (req, res) => {
  res.status(403).json({ success: false, error: 'Evidence is immutable and cannot be deleted for legal integrity.' })
}
