const express = require('express');
const { generateProjectStructure } = require('../controllers/CodeController');
const router = express.Router()

// In your routes file
router.post('/generate-project', generateProjectStructure);

module.exports = router