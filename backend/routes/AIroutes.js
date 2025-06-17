const express = require('express');
const { generateDatabaseSchema, chatWithAI, generateAPI } = require('../controllers/AIController');

const router = express.Router();
 
// POST /api/ai/generate-schema
router.post('/generate-schema', generateDatabaseSchema);

// POST /api/ai/chat
router.post('/chat', chatWithAI);

router.post('/generate-api', generateAPI);

module.exports = router;