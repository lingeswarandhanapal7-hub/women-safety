const router = require('express').Router()
const ctrl = require('../controllers/community.controller')
const auth = require('../middleware/auth')

router.get('/nearby',       auth, ctrl.getNearby)
router.post('/report',      auth, ctrl.createReport)
router.get('/heatmap',      auth, ctrl.getHeatmap)
router.patch('/upvote/:id', auth, ctrl.upvote)

module.exports = router
