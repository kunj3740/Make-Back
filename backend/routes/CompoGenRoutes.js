const express = require('express');
const CompoGenController = require('../controllers/CompoGenController');
const router = express.Router();

router.get('/', CompoGenController.GetFrontendCode);

module.exports = router;