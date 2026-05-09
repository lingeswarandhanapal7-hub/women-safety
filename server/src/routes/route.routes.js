const router = require('express').Router()
const ctrl = require('../controllers/route.controller')
const auth = require('../middleware/auth')

router.post('/safe',   auth, ctrl.getSafeRoute)
router.get('/history', auth, ctrl.getHistory)

module.exports = router
