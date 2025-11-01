const express = require('express');
const { generateProjectStructure, createGithubRepo, deployToRender, getDeploymentStatus, deleteDeployment } = require('../controllers/CodeController');
const router = express.Router()
const auth = require("../middleware/auth");
// In your routes file
router.use(auth);

router.post('/generate-project', generateProjectStructure);

router.post('/github/create-repo/:projectId',createGithubRepo);
// Deploy project to Render
router.post('/render/:projectId', deployToRender);

// Get deployment status
router.get('/render/status/:projectId', getDeploymentStatus);

// Delete deployment
router.delete('/render/:projectId', deleteDeployment);

module.exports = router