const router = require('express').Router()
const ctrl = require('../controllers/checkin.controller')
const auth = require('../middleware/auth')

router.post('/schedule',     auth, ctrl.schedule)
router.patch('/respond/:id', auth, ctrl.respond)
router.get('/pending',       auth, ctrl.getPending)
router.get('/history',       auth, ctrl.getHistory)

module.exports = router
