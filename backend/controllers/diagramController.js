const Diagram = require('../models/Diagram');
const { validationResult } = require('express-validator');

const diagramController = {
  // Create a new diagram
  createDiagram: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name, description, projectId, entities } = req.body;
      console.log(req.body.entities);
      const userId = req.userId; // From auth middleware

      // Validate entities structure
      if (entities && !Array.isArray(entities)) {
        return res.status(400).json({
          success: false,
          message: 'Entities must be an array'
        });
      }

      const diagram = new Diagram({
        name,
        description,
        projectId,
        userId,
        entities: entities || []
      });

      await diagram.save();

      res.status(201).json({
        success: true,
        message: 'Diagram created successfully',
        data: diagram
      });
    } catch (error) {
      console.error('Error creating diagram:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create diagram',
        error: error.message
      });
    }
  },

  // Get all diagrams for a project
  getDiagramsByProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const diagrams = await Diagram.find({ 
        projectId, 
        userId 
      })
      .select('name description createdAt updatedAt metadata')
      .sort({ updatedAt: -1 });

      res.json({
        success: true,
        data: diagrams,
        count: diagrams.length
      });
    } catch (error) {
      console.error('Error fetching diagrams:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch diagrams',
        error: error.message
      });
    }
  },

  // NEW: Get first diagram for a project (for auto-loading)
  getFirstDiagramByProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.userId; // From auth middleware
      const diagram = await Diagram.findOne({ 
        projectId, 
        userId 
      })
      .sort({ updatedAt: -1 }); // Get the most recently updated diagram

      if (!diagram) {
        return res.status(404).json({
          success: false,
          message: 'No diagram found for this project'
        });
      }
      
      res.json({
        success: true,
        data: diagram
      });
    } catch (error) {
      console.error('Error fetching first diagram:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch diagram',
        error: error.message
      });
    }
  },

  // Get a specific diagram
  getDiagramById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      console.log("In the get Diagram from id")
      const diagram = await Diagram.findOne({ 
        _id: id, 
        userId 
      });

      if (!diagram) {
        return res.status(404).json({
          success: false,
          message: 'Diagram not found'
        });
      }

      res.json({
        success: true,
        data: diagram
      });
    } catch (error) {
      console.error('Error fetching diagram:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch diagram',
        error: error.message
      });
    }
  },

  // Update a diagram
  updateDiagram: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.userId;
      delete updateData.createdAt;

      const diagram = await Diagram.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!diagram) {
        return res.status(404).json({
          success: false,
          message: 'Diagram not found'
        });
      }

      res.json({
        success: true,
        message: 'Diagram updated successfully',
        data: diagram
      });
    } catch (error) {
      console.error('Error updating diagram:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update diagram',
        error: error.message
      });
    }
  },

  // Delete a diagram
  deleteDiagram: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const diagram = await Diagram.findOneAndDelete({ 
        _id: id, 
        userId 
      });

      if (!diagram) {
        return res.status(404).json({
          success: false,
          message: 'Diagram not found'
        });
      }

      res.json({
        success: true,
        message: 'Diagram deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting diagram:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete diagram',
        error: error.message
      });
    }
  },

  // Duplicate a diagram
  duplicateDiagram: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const originalDiagram = await Diagram.findOne({ 
        _id: id, 
        userId 
      });

      if (!originalDiagram) {
        return res.status(404).json({
          success: false,
          message: 'Diagram not found'
        });
      }

      const duplicatedDiagram = new Diagram({
        name: `${originalDiagram.name} (Copy)`,
        description: originalDiagram.description,
        projectId: originalDiagram.projectId,
        userId: originalDiagram.userId,
        entities: originalDiagram.entities.map(entity => ({
          ...entity.toObject(),
          id: Date.now() + Math.random(), // Generate new IDs
          x: entity.x + 50, // Offset position
          y: entity.y + 50
        }))
      });

      await duplicatedDiagram.save();

      res.status(201).json({
        success: true,
        message: 'Diagram duplicated successfully',
        data: duplicatedDiagram
      });
    } catch (error) {
      console.error('Error duplicating diagram:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to duplicate diagram',
        error: error.message
      });
    }
  },

  // Export diagram as JSON
  exportDiagram: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const diagram = await Diagram.findOne({ 
        _id: id, 
        userId 
      });

      if (!diagram) {
        return res.status(404).json({
          success: false,
          message: 'Diagram not found'
        });
      }

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${diagram.name}.json"`);

      res.json({
        name: diagram.name,
        description: diagram.description,
        entities: diagram.entities,
        metadata: {
          ...diagram.metadata,
          exportedAt: new Date().toISOString(),
          exportedBy: userId
        }
      });
    } catch (error) {
      console.error('Error exporting diagram:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export diagram',
        error: error.message
      });
    }
  }
};

module.exports = diagramController;