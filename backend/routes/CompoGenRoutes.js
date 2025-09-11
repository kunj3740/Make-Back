const express = require('express');
const router = express.Router();
const CompoGenController = require('../controllers/CompoGenController');
const auth = require('../middleware/auth');

// Create new component
router.post('/', auth, CompoGenController.createCompo);

// Update component by ID
router.put('/:id', auth, CompoGenController.updateCompo);

// Get a single component by ID
router.get('/:id', auth, CompoGenController.getCompoById);

// Get all components for a specific project
router.get('/project/:projectId', auth, CompoGenController.getCompoByProjectId);

// Delete component by ID
router.delete('/:id', auth, CompoGenController.deleteCompo);

module.exports = router;
