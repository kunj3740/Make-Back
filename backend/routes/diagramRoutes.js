const express = require('express');
const router = express.Router();
const diagramController = require('../controllers/diagramController');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// Create a new diagram
router.post('/', auth, diagramController.createDiagram);

// Get all diagrams for a project
router.get('/project/:projectId', auth, diagramController.getDiagramsByProject);

// Get a specific diagram
router.get('/:id', auth, diagramController.getDiagramById);

router.get('/from/project/:projectId', auth, diagramController.getFirstDiagramByProject);

// Update a diagram
router.put('/:id', auth, diagramController.updateDiagram);

// Delete a diagram
router.delete('/:id', auth, diagramController.deleteDiagram);

// Duplicate a diagram
router.post('/:id/duplicate', auth, diagramController.duplicateDiagram);

// Export diagram as JSON
router.get('/:id/export', auth, diagramController.exportDiagram);

module.exports = router;