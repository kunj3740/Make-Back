const express = require('express');
const router = express.Router();
const diagramController = require('../controllers/diagramController');
const auth = require('../middleware/auth'); // Assuming you have auth middleware
const { generateAndUploadDiagram, healthCheck  }
 = require('../services/mermaidService');

router.use(express.json({ limit: '10mb' })); // For parsing JSON bodies
router.use(express.urlencoded({ extended: true })); // For form data

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


// POST /api/mermaid/generate
router.post('/generate', generateAndUploadDiagram);

// GET /api/mermaid/health
router.get('/health', healthCheck);

module.exports = router;