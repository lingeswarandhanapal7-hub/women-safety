const router = require('express').Router()
const ctrl = require('../controllers/safety.controller')
const auth = require('../middleware/auth')

router.get('/score',         auth, ctrl.getScore)
router.get('/score/history', auth, ctrl.getHistory)
router.post('/analyze',      auth, ctrl.analyze)
router.post('/shadow',       auth, ctrl.detectShadow)

module.exports = router
