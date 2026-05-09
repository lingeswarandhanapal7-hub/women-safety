const router = require('express').Router()
const ctrl = require('../controllers/wearable.controller')
const auth = require('../middleware/auth')

router.post('/connect',   auth, ctrl.connect)
router.post('/trigger',   auth, ctrl.trigger)
router.post('/heartrate', auth, ctrl.heartrate)

module.exports = router
