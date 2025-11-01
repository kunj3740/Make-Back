const express = require('express')
const auth = require("../middleware/auth");
const { generateDatabaseSchema, generateAPISuggestions,
     createAPIFromSuggestionName, chatWithAI, generateAPI } = require('../controllers/AIController');
const router = express.Router()

router.post('/generate-schema', generateDatabaseSchema);
router.post('/generate/apis/suggestion',auth , generateAPISuggestions);
router.post('/generate/apis/generation',auth , createAPIFromSuggestionName);
router.post('/chat', chatWithAI);
router.post('/generate-api', generateAPI);

module.exports = router