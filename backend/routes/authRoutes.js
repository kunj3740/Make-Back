const express = require('express')
const { signup, signin, googleAuth, githubAuth, checkGithubConnection } = require('../controllers/authController')
const auth = require("../middleware/auth")
const router = express.Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/google-auth', googleAuth)
router.post('/github-auth', githubAuth)
router.post('/check-github', auth ,  checkGithubConnection)

module.exports = router