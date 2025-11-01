const express = require('express');
const { generateDatabaseSchema, chatWithAI, generateAPI, generateAPISuggestions, createAPIFromSuggestionName } = require('../controllers/AIController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
 
// POST /api/ai/generate-schema
router.post('/generate-schema', generateDatabaseSchema);

router.post('/generate/apis/suggestion',authMiddleware , generateAPISuggestions);

router.post('/generate/apis/generation',authMiddleware , createAPIFromSuggestionName);

// router.post('/generate/apis/creation',authMiddleware , generateAndCreateAPIs);

router.post('/chat', chatWithAI);

router.post('/generate-api', generateAPI);

module.exports = router;