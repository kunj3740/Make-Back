const express = require('express')
const { signup, signin, googleAuth, githubAuth } = require('../controllers/authController')

const router = express.Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/google-auth', googleAuth)
router.post('/github-auth', githubAuth)

module.exports = router