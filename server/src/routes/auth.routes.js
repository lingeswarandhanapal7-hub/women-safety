const router = require('express').Router()
const ctrl = require('../controllers/auth.controller')
const auth = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')

router.post('/register', authLimiter, ctrl.register)
router.post('/login',    authLimiter, ctrl.login)
router.post('/logout',   auth, ctrl.logout)
router.post('/refresh',  ctrl.refresh)
router.get('/me',        auth, ctrl.me)
router.patch('/profile', auth, ctrl.updateProfile)

module.exports = router
