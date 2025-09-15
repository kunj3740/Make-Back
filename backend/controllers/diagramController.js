const Diagram = require('../models/Diagram');
const { validationResult } = require('express-validator');
const mermaidService = require("../services/mermaidService");
const { OpenAI } = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  },

  generateMermaidCode: async (req, res) => {
    console.log("In generate ")
    // Helper function to extract relationships from entities
    function extractRelationships(entities) {
      const relationships = [];
      
      entities.forEach(entity => {
        entity.attributes.forEach(attr => {
          if (attr.ref) {
            // Find the referenced entity
            const referencedEntity = entities.find(e => 
              e.name.toLowerCase() === attr.ref.toLowerCase() ||
              e.name.toLowerCase() === attr.ref.toLowerCase().replace(/s$/, '') // Handle plurals
            );
            
            if (referencedEntity) {
              relationships.push({
                from: entity.name,
                to: referencedEntity.name,
                type: 'belongs_to', // Default relationship type
                foreignKey: attr.name
              });
            }
          }
        });
      });
      
      return relationships;
    }

    // Helper function to build schema prompt for AI
    function buildSchemaPrompt(schemaInfo) {
      const entitiesDescription = schemaInfo.entities.map(entity => {
        const attributesDesc = entity.attributes.map(attr => {
          let desc = `- ${attr.name} (${attr.type})`;
          if (attr.isPrimaryKey) desc += ' [PRIMARY KEY]';
          if (attr.isForeignKey) desc += ` [FOREIGN KEY -> ${attr.reference}]`;
          if (attr.unique && !attr.isPrimaryKey) desc += ' [UNIQUE]';
          if (attr.hasDefault) desc += ` [DEFAULT: ${attr.defaultValue}]`;
          return desc;
        }).join('\n    ');
        
        return `${entity.name}:\n    ${attributesDesc}`;
      }).join('\n\n');

      const relationshipsDescription = schemaInfo.relationships.length > 0 
        ? schemaInfo.relationships.map(rel => 
            `${rel.from} -> ${rel.to} (${rel.type}, foreign key: ${rel.foreignKey})`
          ).join('\n')
        : 'No explicit relationships defined';

      return `Generate a Mermaid ER diagram for the following database schema:

  PROJECT: ${schemaInfo.projectName}
  DIAGRAM: ${schemaInfo.diagramName}
  ${schemaInfo.description ? `DESCRIPTION: ${schemaInfo.description}` : ''}

  ENTITIES:
  ${entitiesDescription}

  RELATIONSHIPS:
  ${relationshipsDescription}

  Please generate clean Mermaid ER diagram code following this exact format:

  erDiagram
      ENTITY1 ||--o{ ENTITY2 : relationship_label
      ENTITY1 {
          int id PK
          string name
          string email UK
      }
      ENTITY2 ||--|{ ENTITY3 : contains
      ENTITY2 {
          int id PK
          date created_date
          float amount
          int entity1_id FK
      }

  Requirements:
  1. Start with "erDiagram"
  2. Define relationships FIRST using proper Mermaid notation:
    - One-to-many: ||--o{
    - One-to-one: ||--||
    - Many-to-many: }o--o{
  3. Use meaningful relationship labels (without quotes)
  4. Define entities with their attributes AFTER relationships
  5. Use proper data types: int, string, float, date, boolean, text
  6. Add constraints: PK (Primary Key), FK (Foreign Key), UK (Unique Key)
  7. Ensure proper indentation (4 spaces for relationships, 8 spaces for attributes)

  Return ONLY the Mermaid code, no explanations or markdown formatting.`;
    }

    // Improved validation function for Mermaid ER diagrams
    function validateAndCleanMermaidCode(aiResponse) {
      let code = aiResponse.trim();
      
      // Remove any markdown code blocks if present
      code = code.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '');
      
      // Remove any extra whitespace or formatting
      code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      // Ensure it starts with erDiagram
      if (!code.startsWith('erDiagram')) {
        throw new Error('Generated code must start with "erDiagram"');
      }
      
      const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Check if we have valid entities (lines containing {)
      const hasValidEntities = lines.some(line => line.includes('{') && !line.includes('||') && !line.includes('}o') && !line.includes('o{'));
      
      if (!hasValidEntities) {
        throw new Error('Generated code lacks valid entity definitions');
      }
      
      // Validate entity structure more accurately
      let entityOpenCount = 0;
      let entityCloseCount = 0;
      let insideEntity = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip erDiagram declaration and relationship lines
        if (line === 'erDiagram' || line.includes('||--') || line.includes('}o--') || line.includes('o{--')) {
          continue;
        }
        
        // Check for entity opening
        if (line.includes('{') && !insideEntity) {
          entityOpenCount++;
          insideEntity = true;
        }
        
        // Check for entity closing
        if (line.trim() === '}' && insideEntity) {
          entityCloseCount++;
          insideEntity = false;
        }
      }
      
      // Validate entity structure
      if (entityOpenCount !== entityCloseCount) {
        console.log('DEBUG: Entity open count:', entityOpenCount);
        console.log('DEBUG: Entity close count:', entityCloseCount);
        console.log('DEBUG: Generated code:', code);
        throw new Error(`Entity structure mismatch: ${entityOpenCount} opening braces, ${entityCloseCount} closing braces`);
      }
      
      // Additional validation: ensure each entity has at least one attribute
      const entityBlocks = code.split(/\n\s*}\s*\n/);
      for (let i = 0; i < entityBlocks.length - 1; i++) { // -1 because last split will be empty or incomplete
        const block = entityBlocks[i];
        if (block.includes('{')) {
          const attributeLines = block.split('{')[1]?.split('\n').filter(line => 
            line.trim() && !line.includes('||--') && !line.includes('}o--')
          );
          
          if (!attributeLines || attributeLines.length === 0) {
            throw new Error(`Entity has no attributes: ${block.split('{')[0].trim()}`);
          }
        }
      }
      
      return code;
    }

    try {
      const { diagramId } = req.body;
      
      if (!diagramId) {
        return res.status(400).json({ error: "Diagram ID is required" });
      }

      console.log("🔍 Fetching diagram schema for ID:", diagramId);

      // Fetch the diagram from database
      const diagram = await Diagram.findById(diagramId)
        .populate('projectId', 'name')
        .populate('userId', 'name email');

      if (!diagram) {
        return res.status(404).json({ error: "Diagram not found" });
      }

      // Build comprehensive schema information
      const schemaInfo = {
        diagramName: diagram.name,
        description: diagram.description,
        projectName: diagram.projectId?.name || 'Unknown Project',
        entities: diagram.entities.map(entity => ({
          name: entity.name,
          attributes: entity.attributes.map(attr => ({
            name: attr.name,
            type: attr.type,
            unique: attr.unique,
            hasDefault: !!attr.default,
            defaultValue: attr.default,
            reference: attr.ref || null,
            isPrimaryKey: attr.name.toLowerCase().includes('id') && attr.unique,
            isForeignKey: !!attr.ref
          }))
        })),
        relationships: extractRelationships(diagram.entities),
        metadata: diagram.metadata
      };

      console.log("📊 Extracted schema info:", JSON.stringify(schemaInfo, null, 2));

      // Build prompt for AI
      const prompt = buildSchemaPrompt(schemaInfo);
      console.log("🤖 AI Prompt:", prompt);

      // Generate Mermaid code using OpenAI
      console.log("🚀 Requesting Mermaid code generation from OpenAI...");
      
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert database architect and Mermaid diagram specialist. Generate clean, syntactically correct Mermaid ER diagrams based on database schemas. Always follow the exact format specifications provided. Each entity must be properly closed with a closing brace on its own line."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const aiGeneratedCode = completion.choices[0]?.message?.content;

      if (!aiGeneratedCode) {
        throw new Error('No response received from OpenAI');
      }

      console.log("🤖 AI Generated Code:", aiGeneratedCode);

      // Validate and clean the AI-generated code
      let mermaidCode;
      try {
        mermaidCode = validateAndCleanMermaidCode(aiGeneratedCode);
      } catch (validationError) {
        console.error("❌ Validation failed:", validationError.message);
        console.log("🔧 Attempting to fix common issues...");
        
        // Try to fix common formatting issues
        let fixedCode = aiGeneratedCode.trim();
        fixedCode = fixedCode.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '');
        
        // Ensure proper entity closing
        const lines = fixedCode.split('\n');
        const fixedLines = [];
        let insideEntity = false;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === 'erDiagram') {
            fixedLines.push(trimmedLine);
            continue;
          }
          
          // Relationship lines
          if (trimmedLine.includes('||--') || trimmedLine.includes('}o--')) {
            fixedLines.push(`    ${trimmedLine}`);
            continue;
          }
          
          // Entity opening
          if (trimmedLine.includes('{') && !insideEntity) {
            fixedLines.push(`    ${trimmedLine}`);
            insideEntity = true;
            continue;
          }
          
          // Entity attributes
          if (insideEntity && trimmedLine && trimmedLine !== '}') {
            fixedLines.push(`        ${trimmedLine}`);
            continue;
          }
          
          // Entity closing
          if (trimmedLine === '}' || (insideEntity && !trimmedLine)) {
            if (insideEntity) {
              fixedLines.push('    }');
              insideEntity = false;
            }
            continue;
          }
        }
        
        // Ensure all entities are properly closed
        if (insideEntity) {
          fixedLines.push('    }');
        }
        
        fixedCode = fixedLines.join('\n');
        console.log("🔧 Fixed code:", fixedCode);
        
        // Try validation again
        mermaidCode = validateAndCleanMermaidCode(fixedCode);
      }
      
      console.log("✅ Validated Mermaid ER diagram code:\n", mermaidCode);

      // Inject the AI-generated code into request for further processing
      req.body.mermaidCode = mermaidCode;

      return mermaidService.generateAndUploadDiagram(req, res);
      
      
    } catch (error) {
      console.error("❌ Error in AI-powered generateMermaidCode:", error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          success: false,
          error: "AI service quota exceeded. Please try again later.",
        });
      }
      
      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded. Please try again in a moment.",
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate ER diagram from schema using AI",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

};

module.exports = diagramController;