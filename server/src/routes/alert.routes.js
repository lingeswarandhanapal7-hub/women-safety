const router = require('express').Router()
const ctrl = require('../controllers/alert.controller')
const auth = require('../middleware/auth')
const { alertLimiter } = require('../middleware/rateLimit')

router.post('/trigger',       auth, alertLimiter, ctrl.trigger)
router.post('/escalate/:id',  auth, ctrl.escalate)
router.patch('/resolve/:id',  auth, ctrl.resolve)
router.post('/silent',        auth, ctrl.silentTrigger)
router.get('/active',         auth, ctrl.getActive)
router.get('/history',        auth, ctrl.getHistory)

module.exports = router
