const express = require('express')
const { signup, signin, googleAuth } = require('../controllers/authController')

const router = express.Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/google-auth', googleAuth)

module.exports = router
