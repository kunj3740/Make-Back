const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Folder = require('../models/Folder');
const Diagram = require('../models/Diagram');
const Project = require('../models/Project');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});


const generateAPISuggestions = async (req, res) => {
  try {
    const { folderName, folderDescription, commonPrompt, projectId } = req.body;
    
    console.log('=== GENERATE API SUGGESTIONS DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!folderName) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    // Fetch diagram entities for context
    const diagram = await Diagram.findOne({ projectId: projectId });
    let entitiesContext = '';
    
    if (diagram && diagram.entities && diagram.entities.length > 0) {
      const entitiesInfo = diagram.entities.map(entity => {
        const attributes = entity.attributes.map(attr => 
          `${attr.name}: ${attr.type}${attr.unique ? ' (unique)' : ''}${attr.ref ? ` (ref: ${attr.ref})` : ''}`
        ).join(', ');
        
        return `${entity.name} { ${attributes} }`;
      }).join('\n');

      entitiesContext = `\n\nDatabase Entities Context:
The following entities are available in the database schema:
${entitiesInfo}

Please consider these entities when suggesting APIs and use appropriate relationships where applicable.`;
    }

    const systemPrompt = `You are an expert backend API architect. Based on the folder information and database context, suggest a comprehensive list of REST API endpoints that would be commonly needed.

Generate a JSON response with an array of API suggestions in the following format:

{
  "suggestions": [
    {
      "name": "Get All Users",
    },
    {
      "name": "Create User",
    }
  ]
}

Rules:
- Format everything in valid JSON only.
- Do not include markdown (no triple backticks).
- Suggest 8-15 relevant API endpoints based on the folder context.
- Include CRUD operations for main entities.
- Follow RESTful best practices.
- Use lowercase route naming convention.
- Consider the database entities provided for proper data modeling.
- Group related APIs by category.
- Make suggestions practical and commonly used.
- Include authentication, validation, and business logic APIs where appropriate.

Important:- 
- just give the suggestions as per the need of the folder only for example todo than just 5 operations 
 create todo delete update read from id and read all so this way only needed apis only you should be creating 
- give only needed apis suggestions 

${commonPrompt ? `\nCommon Instructions: ${commonPrompt}` : ''}${entitiesContext}`;

    const userPrompt = `Folder Name: ${folderName}
${folderDescription ? `Folder Description: ${folderDescription}` : ''}

Please suggest relevant REST API endpoints for this folder context.`;

    // Generate suggestions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    let responseContent = completion.choices[0].message.content;
    responseContent = responseContent.replace(/^```(?:json)?|```$/g, '').trim();

    let suggestionsObject;
    try {
      suggestionsObject = JSON.parse(responseContent);

      // Validate the structure
      if (!suggestionsObject.suggestions || !Array.isArray(suggestionsObject.suggestions)) {
        throw new Error('Invalid response format: suggestions array is required');
      }

    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response',
        details: parseError.message,
        raw: responseContent
      });
    }

    // Format suggestions for consistent structure
    const formattedSuggestions = suggestionsObject.suggestions.map((suggestion, index) => ({
      id: index,
      name: suggestion.name.trim(),
    }));

    return res.json({
      success: true,
      suggestions: formattedSuggestions,
      message: 'API suggestions generated successfully',
      context: {
        folderName,
        folderDescription: folderDescription || null,
        usedCommonPrompt: !!commonPrompt,
        entitiesFound: diagram ? diagram.entities.length : 0,
        totalSuggestions: formattedSuggestions.length
      }
    });

  } catch (error) {
    console.error('API Suggestions Generation Error:', error);

    if (error.code === 'insufficient_quota') {
      res.status(429).json({
        success: false,
        error: 'OpenAI API quota exceeded',
        message: 'Please check your OpenAI API usage and billing.'
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({
        success: false,
        error: 'Invalid OpenAI API key',
        message: 'Please check your OpenAI API key configuration.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate API suggestions',
        details: error.message
      });
    }
  }
};

const createAPIFromSuggestionName = async (req, res) => {
  try {
    const { 
      folderId, 
      projectId, 
      suggestionName,
      folderName,
      folderDescription,
      commonPrompt 
    } = req.body;
    
    console.log('=== CREATE API FROM SUGGESTION NAME DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID from token:', req.userId);
    
    // Validate required fields
    if (!folderId || !folderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Valid folder ID is required'
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!suggestionName || typeof suggestionName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Suggestion name is required'
      });
    }

    // Find the folder
    console.log('Finding folder with ID:', folderId, 'for user:', req.userId);

    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.userId
    });

    console.log('Folder found:', folder ? 'Yes' : 'No');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    // Fetch diagram entities for context
    const diagram = await Diagram.findOne({ projectId: projectId });
    let entitiesContext = '';
    
    if (diagram && diagram.entities && diagram.entities.length > 0) {
      const entitiesInfo = diagram.entities.map(entity => {
        const attributes = entity.attributes.map(attr => 
          `${attr.name}: ${attr.type}${attr.unique ? ' (unique)' : ''}${attr.ref ? ` (ref: ${attr.ref})` : ''}`
        ).join(', ');
        
        return `${entity.name} { ${attributes} }`;
      }).join('\n');

      entitiesContext = `\n\nDatabase Entities Context:
The following entities are available in the database schema:
${entitiesInfo}

Please consider these entities when suggesting APIs and use appropriate relationships where applicable.`;
    }

    let apiObject;

    // First generate all suggestions to find the matching one
    const allSuggestionsPrompt = `You are an expert backend API architect. Based on the folder information and database context, suggest a comprehensive list of REST API endpoints that would be commonly needed.

Generate a JSON response with an array of API suggestions in the following format:

{
  "suggestions": [
    {
      "name": "Get All Users",
      "description": "Retrieve all users with pagination",
      "method": "GET",
      "endpoint": "/users",
      "category": "User Management"
    }
  ]
}

Rules:
- Format everything in valid JSON only.
- Do not include markdown (no triple backticks).
- Suggest 8-15 relevant API endpoints based on the folder context.
- Include CRUD operations for main entities.
- Follow RESTful best practices.
- Use lowercase route naming convention.
- Consider the database entities provided for proper data modeling.
- Group related APIs by category.
- Make suggestions practical and commonly used.
- Include authentication, validation, and business logic APIs where appropriate.

${commonPrompt ? `\nCommon Instructions: ${commonPrompt}` : ''}${entitiesContext}`;

    const suggestionsUserPrompt = `Folder Name: ${folderName}
${folderDescription ? `Folder Description: ${folderDescription}` : ''}

Please suggest relevant REST API endpoints for this folder context.`;

    // Generate all suggestions first
    const suggestionsCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: allSuggestionsPrompt,
        },
        {
          role: "user",
          content: suggestionsUserPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    let suggestionsResponseContent = suggestionsCompletion.choices[0].message.content;
    suggestionsResponseContent = suggestionsResponseContent.replace(/^```(?:json)?|```$/g, '').trim();

    let suggestionsObject;
    try {
      suggestionsObject = JSON.parse(suggestionsResponseContent);
    } catch (parseError) {
      console.error('Failed to parse suggestions response:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI suggestions response',
        details: parseError.message
      });
    }

    // Find the matching suggestion by name
    const matchingSuggestion = suggestionsObject.suggestions.find(
      suggestion => suggestion.name.trim().toLowerCase() === suggestionName.trim().toLowerCase()
    );

    if (!matchingSuggestion) {
      return res.status(404).json({
        success: false,
        error: 'No matching API suggestion found for the provided name',
        availableSuggestions: suggestionsObject.suggestions.map(s => s.name)
      });
    }

    // Check for duplicate endpoint in the same folder BEFORE generating the API
    const methodUpper = matchingSuggestion.method.toUpperCase();
    const existingApi = folder.apis.find(
      api => api.method === methodUpper && api.endpoint === matchingSuggestion.endpoint
    );

    if (existingApi) {
      return res.status(409).json({
        success: false,
        error: `API endpoint ${methodUpper} ${matchingSuggestion.endpoint} already exists in this folder`
      });
    }

    // Generate complete API using OpenAI - Updated prompt to match schema
    const apiGenerationPrompt = `You are an expert backend API generator. Based on the API suggestion, generate a complete REST API definition in the following JSON format:

{
  "name": "${matchingSuggestion.name}",
  "description": "${matchingSuggestion.description}",
  "method": "${matchingSuggestion.method}",
  "endpoint": "${matchingSuggestion.endpoint}",
  "controllerCode": "exports.controllerFunctionName = async (req, res) => {
                        try {
                        } catch (error) {
                        }
                      }",
  "controllerName": "controllerFunctionName",
  "testCases": [
    {
      "name": "Test name",
      "input": {
        "params": {},
        "query": {},
        "body": {}
      },
      "expectedOutput": {
        "response": {
          "success": true,
          "data": {},
          "message": "..."
        }
      },
      "description": "What this test case checks"
    }
  ],
  "documentation": {
    "summary": "Short summary of what this API does",
    "parameters": [
      {
        "name": "paramName",
        "type": "string",
        "required": true,
        "description": "Parameter description",
        "location": "params"
      }
    ]
  }
}

Rules:
- Format everything in valid JSON only.
- Do not include markdown (no triple backticks).
- controllerCode must be complete, functional JavaScript code.
- controllerName should be a camelCase function name without spaces.
- Include proper error handling with try-catch blocks.
- Use appropriate HTTP status codes.
- Follow RESTful best practices.
- Consider the database entities provided for proper data modeling.
- Include at least one test case for success scenario.
- Make the API production-ready with proper validation.
- Parameters location must be one of: 'query', 'body', 'params', 'headers'

${commonPrompt ? `\nCommon Instructions: ${commonPrompt}` : ''}${entitiesContext}`;

    const apiCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: apiGenerationPrompt,
        },
        {
          role: "user",
          content: `Generate a complete API for: ${matchingSuggestion.name} - ${matchingSuggestion.description}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    let apiResponseContent = apiCompletion.choices[0].message.content;
    apiResponseContent = apiResponseContent.replace(/^```(?:json)?|```$/g, '').trim();

    try {
      apiObject = JSON.parse(apiResponseContent);
      
      // Validate the generated API structure according to schema
      const requiredApiFields = ['name', 'method', 'endpoint', 'controllerCode', 'controllerName', 'testCases', 'documentation'];
      const isValidApi = requiredApiFields.every(field => apiObject.hasOwnProperty(field));

      if (!isValidApi) {
        throw new Error('Missing required fields in the generated API');
      }

      // Validate test cases structure
      if (!Array.isArray(apiObject.testCases) || apiObject.testCases.length === 0) {
        throw new Error('testCases must be a non-empty array');
      }

      // Validate each test case structure
      for (const testCase of apiObject.testCases) {
        if (!testCase.name || !testCase.input || !testCase.expectedOutput || !testCase.expectedOutput.response) {
          throw new Error('Invalid test case structure');
        }
        
        // Ensure input has required structure
        if (!testCase.input.params) testCase.input.params = {};
        if (!testCase.input.query) testCase.input.query = {};
        if (!testCase.input.body) testCase.input.body = {};
      }

      // Validate documentation structure
      if (!apiObject.documentation || !Array.isArray(apiObject.documentation.parameters)) {
        apiObject.documentation = {
          summary: apiObject.documentation?.summary || apiObject.description || '',
          parameters: []
        };
      }

      // Validate parameter locations
      apiObject.documentation.parameters.forEach(param => {
        const validLocations = ['query', 'body', 'params', 'headers'];
        if (!validLocations.includes(param.location)) {
          param.location = 'body'; // Default fallback
        }
      });

    } catch (apiParseError) {
      console.error(`Failed to parse API generation for ${matchingSuggestion.name}:`, apiParseError);
      
      // Fallback to basic template if AI generation fails
      const controllerName = matchingSuggestion.name.replace(/\s+/g, '') + 'Controller';
      apiObject = {
        name: matchingSuggestion.name,
        description: matchingSuggestion.description,
        method: matchingSuggestion.method,
        endpoint: matchingSuggestion.endpoint,
        controllerCode: `async function ${controllerName}(req, res) {
  try {
    // TODO: Implement ${matchingSuggestion.name} logic
    res.json({
      success: true,
      message: '${matchingSuggestion.name} executed successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error in ${matchingSuggestion.name}:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}`,
        controllerName: controllerName,
        testCases: [{
          name: `Test ${matchingSuggestion.name}`,
          input: {
            params: {},
            query: {},
            body: {}
          },
          expectedOutput: {
            response: {
              success: true,
              message: `${matchingSuggestion.name} executed successfully`,
              data: {}
            }
          },
          description: `Test case for ${matchingSuggestion.name}`
        }],
        documentation: {
          summary: matchingSuggestion.description || '',
          parameters: []
        }
      };
    }

    // Create new API object that matches the schema exactly
    const newApi = {
      name: apiObject.name.trim(),
      description: apiObject.description || '',
      method: apiObject.method.toUpperCase(),
      endpoint: apiObject.endpoint.trim(),
      controllerCode: apiObject.controllerCode,
      controllerName: apiObject.controllerName || (apiObject.name.replace(/\s+/g, '') + 'Controller'),
      testCases: apiObject.testCases.map(testCase => ({
        name: testCase.name,
        input: {
          params: testCase.input.params || {},
          query: testCase.input.query || {},
          body: testCase.input.body || {}
        },
        expectedOutput: {
          response: testCase.expectedOutput.response
        },
        description: testCase.description || ''
      })),
      documentation: {
        summary: apiObject.documentation.summary || apiObject.description || '',
        parameters: (apiObject.documentation.parameters || []).map(param => ({
          name: param.name,
          type: param.type,
          required: param.required || false,
          description: param.description || '',
          location: param.location || 'body'
        }))
      }
    };

    // Add the new API to the folder
    folder.apis.push(newApi);
    
    // Get the created API (the last one added)
    const createdApi = folder.apis[folder.apis.length - 1];
    
    // Save the folder
    await folder.save();
    console.log('Folder saved successfully with new API');

    // Return success response
    res.status(201).json({
      success: true,
      message: `API "${suggestionName}" created successfully`,
      data: {
        _id: createdApi._id,
        name: createdApi.name,
        description: createdApi.description,
        method: createdApi.method,
        endpoint: createdApi.endpoint,
        controllerCode: createdApi.controllerCode,
        controllerName: createdApi.controllerName,
        testCases: createdApi.testCases,
        documentation: createdApi.documentation
      }
    });

  } catch (error) {
    console.error('API Creation Error:', error);

    if (error.code === 'insufficient_quota') {
      res.status(429).json({
        success: false,
        error: 'OpenAI API quota exceeded',
        message: 'Please check your OpenAI API usage and billing.'
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({
        success: false,
        error: 'Invalid OpenAI API key',
        message: 'Please check your OpenAI API key configuration.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create API from suggestion',
        details: error.message
      });
    }
  }
};

const generateDatabaseSchema = async (req, res) => {
  try {
    const { prompt, projectId } = req.body;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required' 
      });
    }

    if (!projectId) {
      return res.status(400).json({ 
        error: 'Project ID is required' 
      });
    }

    // Fetch project details
    let projectContext = '';
    try {
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The specified project does not exist'
        });
      }

      // Build project context for the AI
      projectContext = `Project Context:
- Project Name: ${project.name || 'Not specified'}
- Project Description: ${project.description || 'Not specified'}

`;
    } catch (projectError) {
      console.error('Error fetching project:', projectError);
      return res.status(500).json({
        error: 'Failed to fetch project details',
        message: 'Could not retrieve project information'
      });
    }

    const systemPrompt = `
You are a senior database architect with 15+ years of experience in enterprise database design. Generate a comprehensive, production-ready database schema following industry best practices and ACID compliance principles.

CRITICAL INSTRUCTION: YOU MUST RETURN ONLY THE JSON OBJECT. NO DESCRIPTIONS, NO EXPLANATIONS, NO ADDITIONAL TEXT BEFORE OR AFTER THE JSON. JUST THE RAW JSON OBJECT.

MANDATORY DATABASE DESIGN PRINCIPLES:

1. NORMALIZATION STANDARDS:
   - Apply 3NF (Third Normal Form) minimum, 4NF where applicable
   - Eliminate redundancy and data anomalies
   - Separate concerns into logical entities
   - Use junction tables for many-to-many relationships

2. NAMING CONVENTIONS:
   - Table names: snake_case, plural nouns (users, order_items, user_profiles)
   - Column names: snake_case, descriptive (first_name, created_at, is_active)
   - Primary keys: Always 'id'
   - Foreign keys: {referenced_table}_id (user_id, product_id)
   - Boolean columns: is_, has_, can_ prefix (is_active, has_verified_email)
   - Timestamps: created_at, updated_at, deleted_at (for soft deletes)

3. DATA INTEGRITY CONSTRAINTS:
   - Every table MUST have a primary key
   - Use appropriate foreign key constraints
   - Implement NOT NULL for required fields
   - Add CHECK constraints for data validation
   - Use UNIQUE constraints for business rules

4. RELATIONSHIP PATTERNS:
   - One-to-Many: Parent table id referenced in child table
   - Many-to-Many: Junction table with composite keys
   - One-to-One: Usually via shared primary key or unique foreign key
   - Self-referencing: parent_id pointing to same table

5. DATA TYPE REQUIREMENTS (CRITICAL):
   - YOU MUST ONLY USE THESE EXACT DATA TYPES: "string", "number", "boolean", "date", "text"
   - NEVER use: bigint, varchar, int, timestamp, varchar(255), or any other data types
   - Map database types as follows:
     * bigint/int/integer → "number"
     * varchar/char/text → "string" (use "text" only for large text fields)
     * timestamp/datetime → "date"
     * bool/boolean → "boolean"
   - For id fields, use type "number"
   - For created_at/updated_at, use type "date"


RESPONSE FORMAT - FOLLOW THIS EXACT STRUCTURE:
{
  "entities": [
    {
      "id": 1,
      "name": "TableName",
      "x": 100,
      "y": 100,
      "attributes": [
        {
          "name": "id",
          "type": "number",
          "unique": true,
          "default": "",
          "ref": ""
        },
        {
          "name": "column_name",
          "type": "string",
          "unique": false,
          "default": "",
          "ref": ""
        },
        {
          "name": "is_active",
          "type": "boolean",
          "unique": false,
          "default": "true",
          "ref": ""
        },
        {
          "name": "created_at",
          "type": "date",
          "unique": false,
          "default": "",
          "ref": ""
        },
        {
          "name": "user_id",
          "type": "number",
          "unique": false,
          "default": "",
          "ref": "Users.id"
        }
      ]
    }
  ]
}

FIELD SPECIFICATIONS:
- id: Must be a unique number for each entity (1, 2, 3, etc.)
- name: Entity/table name in PascalCase or snake_case
- x, y: Coordinates for positioning (x: 50-800, y: 50-600)
- attributes: Array of column definitions
  - name: Column name (snake_case)
  - type: MUST be one of: "string", "number", "boolean", "date", "text"
  - unique: true/false (primary keys must be true)
  - default: String value for default (empty string "" if none)
  - ref: Reference to another table in format "TableName.columnName" (empty string "" if not a foreign key)

MANDATORY REQUIREMENTS:
1. Every entity MUST have an 'id' attribute with type "number" and unique: true
2. Include created_at and updated_at attributes with type "date" for all main entities
3. Use proper foreign key relationships with clear references in format "TableName.columnName"
4. Apply consistent naming conventions
5. Include junction tables for many-to-many relationships
6. Normalize to eliminate redundancy
7. ONLY use the 5 allowed data types: "string", "number", "boolean", "date", "text"

POSITIONING GUIDELINES:
- Spread entities across canvas (x: 50-800, y: 50-600)
- Place related entities near each other
- Leave space for relationship lines
- Core entities in center, supporting entities around periphery

CRITICAL REMINDER: 
1. Return ONLY the JSON object. No markdown code blocks, no explanations, no additional text.
2. ONLY use these data types: "string", "number", "boolean", "date", "text"
3. For references, use format "TableName.columnName" or empty string ""

Generate a schema that a senior DBA would approve for production use. Focus on data integrity, performance, scalability, and maintainability.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `${projectContext}User Requirements: ${prompt}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    let responseContent = completion.choices[0].message.content;

    // Strip out ```json or ``` and trim whitespace
    responseContent = responseContent.replace(/^```(?:json)?|```$/g, '').trim();
    console.log(responseContent)
    try {
      const parsedSchema = JSON.parse(responseContent);
  
      if (!parsedSchema.entities || !Array.isArray(parsedSchema.entities)) {
        throw new Error('Invalid schema structure');
      }

      res.json({
        success: true,
        schema: parsedSchema.entities,
        message: 'Database schema generated successfully'
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      res.status(500).json({
        error: 'Failed to parse AI response',
        details: parseError.message,
        raw: responseContent
      });
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error.code === 'insufficient_quota') {
      res.status(429).json({
        error: 'OpenAI API quota exceeded',
        message: 'Please check your OpenAI API usage and billing.'
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({
        error: 'Invalid OpenAI API key',
        message: 'Please check your OpenAI API key configuration.'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate database schema'
      });
    }
  }
};
const generateAPI = async (req, res) => {
  try {
    const { prompt, folderId, projectId, update = false, apiId } = req.body;
    console.log('Generate API prompt:', prompt);
    console.log('Update mode:', update);
    
    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    if (!folderId || !projectId) {
      return res.status(400).json({
        error: 'Folder ID and Project ID are required'
      });
    }

    // If update mode is true, apiId should be provided
    if (update && !apiId) {
      return res.status(400).json({
        error: 'API ID is required for update operations'
      });
    }

    // Fetch folder to get common prompt
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({
        error: 'Folder not found'
      });
    }

    // Fetch diagram entities for context
    const diagram = await Diagram.findOne({ projectId: projectId });
    let modelContext = '';
    let availableModels = [];

    if (diagram && diagram.generatedModels && diagram.generatedModels.length > 0) {
      availableModels = diagram.generatedModels.map(model => model.entityName);

      const modelsInfo = diagram.generatedModels.map(model => {
        return `Model: ${model.entityName}\nPath: ${model.path}\nCode:\n${model.code}`;
      }).join('\n\n');

      modelContext = `\n\nDatabase Models Context:
        The following Mongoose models are available:
        ${modelsInfo}

        When generating APIs, import them using the provided path.`;
    }

    const systemPrompt = `You are an expert backend API generator. Based on the user's description, generate a single REST API definition in the following JSON format:

{
  "name": "User Login",
  "description": "Authenticate user and return JWT token",
  "method": "POST",
  "endpoint": "/auth/login",
  "controllerName": "loginUser",
  "controllerCode": "exports.loginUser = async (req, res) => {\\n  try {\\n    const { email, password } = req.body;\\n    if (!email || !password) {\\n      return res.status(400).json({ success: false, message: 'Email and password are required' });\\n    }\\n    const user = await User.findOne({ email });\\n    if (!user) {\\n      return res.status(401).json({ success: false, message: 'Invalid credentials' });\\n    }\\n    const isPasswordValid = await bcrypt.compare(password, user.password);\\n    if (!isPasswordValid) {\\n      return res.status(401).json({ success: false, message: 'Invalid credentials' });\\n    }\\n    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });\\n    return res.status(200).json({ success: true, data: { token, user: { id: user._id, email: user.email, name: user.name } }, message: 'Login successful' });\\n  } catch (error) {\\n    return res.status(500).json({ success: false, message: 'An error occurred during login', error: error.message });\\n  }\\n}",
  "imports": [
    {
      "module": "jsonwebtoken",
      "type": "npm",
      "version": "latest",
      "importStatement": "const jwt = require('jsonwebtoken');"
    },
    {
      "module": "bcryptjs",
      "type": "npm",
      "version": "latest",
      "importStatement": "const bcrypt = require('bcryptjs');"
    },
    {
      "module": "../models/User",
      "type": "local",
      "version": "latest",
      "importStatement": "const User = require('../models/User');"
    }
  ],
  "testCases": [
    {
      "name": "Successful Login",
      "input": {
        "params": {},
        "query": {},
        "body": {
          "email": "user@example.com",
          "password": "password123"
        }
      },
      "expectedOutput": {
        "response": {
          "success": true,
          "data": {
            "token": "jwt.token.here",
            "user": {
              "id": "userId",
              "email": "user@example.com",
              "name": "John Doe"
            }
          },
          "message": "Login successful"
        }
      },
      "description": "Test successful user login with valid credentials"
    }
  ],
  "documentation": {
    "summary": "Authenticate user with email and password, returns JWT token",
    "parameters": [
      {
        "name": "email",
        "type": "string",
        "required": true,
        "description": "User email address",
        "location": "body"
      },
      {
        "name": "password",
        "type": "string",
        "required": true,
        "description": "User password",
        "location": "body"
      }
    ]
  }
}

CRITICAL CODE STRUCTURE RULES:
- ALL code MUST be within the exports.controllerName = async (req, res) => { } wrapper
- NEVER create separate helper functions outside the controller export
- NEVER use function declarations like: function helperFunction() {}
- ALL logic, validation, and operations must be inline within the main controller function
- If you need reusable logic, write it inline or use inline arrow functions assigned to const variables INSIDE the controller
- The controller should be completely self-contained and executable as-is

AUTHENTICATION & JWT RULES (for auth-related APIs):
- For LOGIN/SIGNIN APIs:
  * Use jwt.sign() to generate tokens after successful authentication
  * Sign with: jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })
  * Always use bcrypt.compare() to verify passwords: await bcrypt.compare(plainPassword, hashedPassword)
  * Include jsonwebtoken and bcryptjs in imports
  * Return token in response data along with user info (without password)

- For REGISTER/SIGNUP APIs:
  * Hash passwords using bcrypt.hash() before saving: await bcrypt.hash(password, 10)
  * Optionally generate JWT token after registration
  * Include bcryptjs in imports

- For PROTECTED ROUTE APIs (requiring authentication):
  * Extract token from headers: const token = req.headers.authorization?.split(' ')[1]
  * Verify token using: const decoded = jwt.verify(token, process.env.JWT_SECRET)
  * Return 401 if token is missing or invalid
  * Use decoded data to identify the user

- For PASSWORD RESET/CHANGE APIs:
  * Generate reset tokens: jwt.sign({ userId: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' })
  * Verify old password with bcrypt.compare()
  * Hash new password with bcrypt.hash()

- For TOKEN REFRESH APIs:
  * Verify existing token first
  * Generate new token with extended expiry
  * Return new token in response

MONGOOSE DATABASE RULES:
- All models are Mongoose models, NOT SQL/Sequelize
- Use Mongoose query methods: find(), findById(), findOne(), create(), findByIdAndUpdate(), findByIdAndDelete()
- MongoDB uses _id as the primary key
- For ObjectId references, use proper Mongoose population: .populate('fieldName')
- Use mongoose.Types.ObjectId.isValid() to validate ObjectIds
- For relationships, use proper field naming (userId, not user_id)
- Example queries:
  * Find by ID: Model.findById(id)
  * Find with conditions: Model.find({ userId: userId })
  * Create: Model.create(data) or new Model(data).save()
  * Update: Model.findByIdAndUpdate(id, data, { new: true })
  * Delete: Model.findByIdAndDelete(id)
  * Populate: Model.find().populate('userId')

IMPORTS STRUCTURE RULES:
- Each import must be in its own separate object in the imports array
- Each import object must have: module, type, version, and importStatement
- importStatement must use relevant variable names matching the controller code usage
- For JWT: const jwt = require('jsonwebtoken');
- For bcrypt: const bcrypt = require('bcryptjs');
- For models: const ModelName = require('../models/ModelName');
- Type can be: "npm" for packages or "local" for project files
- Available models: ${availableModels.join(', ')}

GENERAL CONTROLLER RULES:
- Format everything in valid JSON only (no markdown, no backticks, no code fences)
- controllerCode MUST start with: exports.functionName = async (req, res) => {
- controllerName should match the function name exactly (e.g., "loginUser", "registerUser")
- Use \\n for line breaks in controllerCode string
- Include proper error handling with try-catch blocks
- Use appropriate HTTP status codes: 
  * 200: Success
  * 201: Created
  * 400: Bad Request (validation errors)
  * 401: Unauthorized (auth failures)
  * 403: Forbidden
  * 404: Not Found
  * 409: Conflict (duplicate entries)
  * 500: Internal Server Error
- Follow RESTful best practices
- Use lowercase route naming convention: /users/:id/profile
- Validate all required inputs at the start of the controller
- Always validate ObjectIds before using them: mongoose.Types.ObjectId.isValid(id)
- Return consistent response format: { success: boolean, data: object, message: string }
- Handle Mongoose errors properly (ValidationError, CastError)

DOCUMENTATION & TESTING:
- Provide exactly ONE test case for the success scenario
- testCases array must include: name, input (params, query, body), expectedOutput, description
- documentation must include: summary and parameters array
- Each parameter must specify: name, type, required, description, location (params/query/body)

${folder.commonPrompt ? `\nCommon Instructions: ${folder.commonPrompt}` : ''}${modelContext}`;

    const userPrompt = `${prompt}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 5000,
    });

    let responseContent = completion.choices[0].message.content;
    responseContent = responseContent.replace(/^```(?:json)?|```$/g, '').trim();
    
    try {
      const apiObject = JSON.parse(responseContent);
      console.log(apiObject)
      
      // Validate required fields
      const requiredFields = ['name', 'method', 'endpoint', 'controllerCode', 'controllerName', 'imports', 'testCases', 'documentation'];
      const isValid = requiredFields.every(field => apiObject.hasOwnProperty(field));

      if (!isValid) {
        const missingFields = requiredFields.filter(field => !apiObject.hasOwnProperty(field));
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate the structure more thoroughly
      if (!Array.isArray(apiObject.testCases) || apiObject.testCases.length === 0) {
        throw new Error('testCases must be a non-empty array');
      }

      if (!apiObject.documentation || !apiObject.documentation.parameters) {
        throw new Error('documentation.parameters is required');
      }

      // Validate controllerName
      if (!apiObject.controllerName || typeof apiObject.controllerName !== 'string') {
        throw new Error('controllerName is required and must be a string');
      }

      // Validate imports structure
      if (!Array.isArray(apiObject.imports)) {
        throw new Error('imports must be an array');
      }

      // Validate each import has required fields
      apiObject.imports.forEach((imp, index) => {
        if (!imp.module || !imp.type || !imp.importStatement) {
          throw new Error(`Import at index ${index} is missing required fields (module, type, importStatement)`);
        }
      });

      // Check for duplicate endpoint in the same folder
      if (!update) {
        const methodUpper = apiObject.method.toUpperCase();
        const existingApi = folder.apis.find(
          api => api.method === methodUpper && api.endpoint === apiObject.endpoint
        );

        if (existingApi) {
          return res.status(409).json({
            success: false,
            error: `API endpoint ${methodUpper} ${apiObject.endpoint} already exists in this folder`,
            suggestion: 'Please modify the endpoint or choose a different method'
          });
        }
      } else {
        // In update mode, check for duplicates excluding the current API being updated
        const methodUpper = apiObject.method.toUpperCase();
        const existingApi = folder.apis.find(
          api => api.method === methodUpper && 
                 api.endpoint === apiObject.endpoint && 
                 api._id.toString() !== apiId
        );

        if (existingApi) {
          return res.status(409).json({
            success: false,
            error: `API endpoint ${methodUpper} ${apiObject.endpoint} already exists in this folder`,
            suggestion: 'Please modify the endpoint or choose a different method'
          });
        }
      }

      res.json({
        success: true,
        api: {
          name: apiObject.name,
          description: apiObject.description,
          method: apiObject.method,
          endpoint: apiObject.endpoint,
          controllerName: apiObject.controllerName,
          controllerCode: apiObject.controllerCode,
          imports: apiObject.imports,
          testCases: apiObject.testCases,
          documentation: apiObject.documentation
        },
        message: update ? 'API updated successfully' : 'API generated successfully',
      });

    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      
      // Fallback: Create a basic API structure if parsing fails
      const fallbackControllerName = prompt.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
      const fallbackApi = {
        name: `Generated API for: ${prompt.substring(0, 50)}`,
        description: `API generated from prompt: ${prompt}`,
        method: "GET",
        endpoint: `/api/${prompt.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`,
        controllerName: fallbackControllerName,
        controllerCode: `exports.${fallbackControllerName} = async (req, res) => {\\n  try {\\n    // TODO: Implement logic for: ${prompt}\\n    res.json({\\n      success: true,\\n      message: 'API executed successfully',\\n      data: {}\\n    });\\n  } catch (error) {\\n    console.error('Error in ${fallbackControllerName}:', error);\\n    res.status(500).json({\\n      success: false,\\n      message: 'Internal server error',\\n      error: error.message\\n    });\\n  }\\n}`,
        imports: [
          {
            module: "express",
            type: "npm",
            version: "latest",
            importStatement: "const express = require('express');"
          }
        ],
        testCases: [{
          name: `Test ${fallbackControllerName}`,
          input: {
            params: {},
            query: {},
            body: {}
          },
          expectedOutput: {
            response: {
              success: true,
              message: 'API executed successfully',
              data: {}
            }
          },
          description: `Test case for ${fallbackControllerName}`
        }],
        documentation: {
          summary: `Generated API for: ${prompt}`,
          parameters: []
        }
      };

      res.json({
        success: true,
        api: fallbackApi,
        message: update ? 'API updated successfully (using fallback)' : 'API generated successfully (using fallback)',
        warning: 'AI response parsing failed, used fallback template',
        context: {
          usedCommonPrompt: !!folder.commonPrompt,
          entitiesFound: diagram ? diagram.entities.length : 0,
          availableModels: availableModels,
          parseError: parseError.message
        }
      });
    }

  } catch (error) {
    console.error('API Generation Error:', error);

    if (error.code === 'insufficient_quota') {
      res.status(429).json({
        success: false,
        error: 'OpenAI API quota exceeded',
        message: 'Please check your OpenAI API usage and billing.'
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({
        success: false,
        error: 'Invalid OpenAI API key',
        message: 'Please check your OpenAI API key configuration.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate API',
        details: error.message
      });
    }
  }
};
// Helper function to append controller code to file (same as previous)
const appendControllerCode = async (folder, controllerCode) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  const controllerFileName = `${folder.name}Controller.js`;
  const controllerFilePath = path.join(process.cwd(), 'generated', 'controllers', controllerFileName);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(controllerFilePath), { recursive: true });
  
  try {
    // Check if file exists, if not create it with initial structure
    let existingContent = '';
    try {
      existingContent = await fs.readFile(controllerFilePath, 'utf8');
    } catch (readError) {
      // File doesn't exist, create initial structure
      const initialContent = `// ${folder.name} Controller\n// Generated controller file\n\n`;
      existingContent = initialContent;
    }
    
    // Append new controller code
    const updatedContent = existingContent + '\n' + controllerCode + '\n';
    
    // Write updated content
    await fs.writeFile(controllerFilePath, updatedContent, 'utf8');
    
    // Update folder's generatedFiles
    folder.generatedFiles = folder.generatedFiles || {};
    folder.generatedFiles.controllerFile = {
      path: controllerFilePath,
      lastGenerated: new Date(),
      hash: require('crypto').createHash('md5').update(updatedContent).digest('hex')
    };
    
  } catch (error) {
    console.error('Error in appendControllerCode:', error);
    throw error;
  }
};

// Helper function to append route code to file (same as previous)
const appendRouteCode = async (folder, routeInfo) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  const routeFileName = `${folder.name}Routes.js`;
  const routeFilePath = path.join(process.cwd(), 'generated', 'routes', routeFileName);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(routeFilePath), { recursive: true });
  
  try {
    // Check if file exists, if not create it with initial structure
    let existingContent = '';
    try {
      existingContent = await fs.readFile(routeFilePath, 'utf8');
    } catch (readError) {
      // File doesn't exist, create initial structure
      const controllerImport = `const controller = require('../controllers/${folder.name}Controller');\n`;
      const routerSetup = `const express = require('express');\nconst router = express.Router();\n\n${controllerImport}\n`;
      const exportStatement = `\nmodule.exports = router;\n`;
      existingContent = routerSetup + exportStatement;
    }
    
    // Create new route line
    const newRoute = `router.${routeInfo.method}('${routeInfo.endpoint}', controller.${routeInfo.controllerName});\n`;
    
    // Insert new route before the module.exports line
    const exportIndex = existingContent.lastIndexOf('module.exports = router;');
    if (exportIndex !== -1) {
      const beforeExport = existingContent.substring(0, exportIndex);
      const afterExport = existingContent.substring(exportIndex);
      const updatedContent = beforeExport + newRoute + '\n' + afterExport;
      
      // Write updated content
      await fs.writeFile(routeFilePath, updatedContent, 'utf8');
      
      // Update folder's generatedFiles
      folder.generatedFiles = folder.generatedFiles || {};
      folder.generatedFiles.routeFile = {
        path: routeFilePath,
        lastGenerated: new Date(),
        hash: require('crypto').createHash('md5').update(updatedContent).digest('hex')
      };
    } else {
      throw new Error('Could not find module.exports in routes file');
    }
    
  } catch (error) {
    console.error('Error in appendRouteCode:', error);
    throw error;
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    const systemPrompt = `You are a helpful AI assistant specialized in database design and schema generation. 
    You help users understand database concepts, provide suggestions for database structure, 
    and explain relationships between entities. Keep responses concise and helpful.
    
    If the user asks about generating a schema, guide them to provide a clear description of their requirements.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      }
    ];

    // Add context if provided (previous conversation)
    if (context && Array.isArray(context)) {
      messages.push(...context);
    }

    messages.push({
      role: "user",
      content: message,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0].message.content;

    res.json({
      success: true,
      response: responseContent,
      message: 'AI response generated successfully'
    });

  } catch (error) {
    console.error('OpenAI Chat API Error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get AI response'
    });
  }
};

module.exports = {
  generateDatabaseSchema,
  chatWithAI,
  generateAPI,
  generateAPISuggestions,
  createAPIFromSuggestionName
};