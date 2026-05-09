const router = require('express').Router()
const ctrl = require('../controllers/evidence.controller')
const auth = require('../middleware/auth')
const { upload } = require('../middleware/upload')

router.post('/upload',          auth, upload.single('file'), ctrl.upload)
router.get('/:alertId',         auth, ctrl.getByAlert)
router.post('/report/:alertId', auth, ctrl.generateReport)
router.delete('/:id',           auth, ctrl.deleteEvidence)

module.exports = router
