const express = require('express');
const { registerUser, loginUser } = require('../controllers/authenticationController');
const router = express.Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

module.exports = router;