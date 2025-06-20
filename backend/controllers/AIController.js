const OpenAI = require('openai');

const Folder = require('../models/Folder');
const Diagram = require('../models/Diagram');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const generateDatabaseSchema = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required' 
      });
    }

    const systemPrompt = `You are a database schema generator. Based on the user's description, generate a JSON response containing database entities with the following structure:

{
  "entities": [
    {
      "id": unique_number,
      "name": "TableName",
      "x": x_coordinate,
      "y": y_coordinate,
      "attributes": [
        {
          "name": "column_name",
          "type": "data_type", // options: "string", "number", "boolean", "date", "text"
          "unique": boolean,
          "default": "default_value",
          "ref": "ReferencedTable.column" // for foreign keys, empty string if not a reference
        }
      ]
    }
  ]
}

Rules:
1. Always include an 'id' attribute as the first attribute for each entity
2. Use appropriate data types: string, number, boolean, date, text
3. Set appropriate x, y coordinates for positioning (spread them out nicely)
4. For foreign keys, use the "ref" field to reference "TableName.column"
5. Common patterns: created_at/updated_at fields, user_id references, etc.
6. Return only valid JSON, no explanations or additional text
7. Make sure the schema is logical and follows database best practices

Generate a comprehensive database schema based on the user's requirements.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    let responseContent = completion.choices[0].message.content;

    // ✅ Strip out ```json or ``` and trim whitespace
    responseContent = responseContent.replace(/^```(?:json)?|```$/g, '').trim();

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
    const { prompt, folderId, projectId } = req.body;
    console.log(prompt);
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

    // Fetch folder to get common prompt
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({
        error: 'Folder not found'
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

Please consider these entities when generating the API and use appropriate relationships where applicable.`;
    }

    const systemPrompt = `You are an expert backend API generator. Based on the user's description, generate a single REST API definition in the following JSON format:

{
  "name": "Get User Profile",
  "description": "Retrieve user profile information by user ID",
  "method": "GET", // One of: GET, POST, PUT, DELETE, PATCH
  "endpoint": "/users/:id/profile",
  "controllerCode": "async function controller(req, res) { ... }", // Use try-catch and return success, error properly
  "testCases": [
    {
      "name": "Test name",
      "input": {
        "params": { "id": "123" },
        "query": {},
        "body": {}
      },
      "expectedOutput": {
        "response": {
          "success": true,
          "data": { ... },
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
        "name": "id",
        "type": "string",
        "required": true,
        "description": "User ID",
        "location": "params"
      }
    ]
  }
}

Rules:
- Format everything in valid JSON only.
- Do not include markdown (no triple backticks).
- controllerCode must be in raw JS (no string escapes).
- All fields must be present as shown.
- Follow RESTful best practices.
- Use lowercase route naming convention.
- Consider the database entities provided for proper data modeling.
- Use appropriate HTTP status codes and error handling.
- the given json format api is just an example make it as users want 

Note: only give one testcase for success only just the inputs for as per given example

${folder.commonPrompt ? `\nCommon Instructions: ${folder.commonPrompt}` : ''}${entitiesContext}`;

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
      max_tokens: 2500,
    });

    let responseContent = completion.choices[0].message.content;
    responseContent = responseContent.replace(/^```(?:json)?|```$/g, '').trim();

    try {
      const apiObject = JSON.parse(responseContent);

      const requiredFields = ['name', 'method', 'endpoint', 'controllerCode', 'testCases', 'documentation'];
      const isValid = requiredFields.every(field => apiObject.hasOwnProperty(field));

      if (!isValid) {
        throw new Error('Missing required fields in the generated API');
      }

      // Validate the structure more thoroughly
      if (!Array.isArray(apiObject.testCases) || apiObject.testCases.length === 0) {
        throw new Error('testCases must be a non-empty array');
      }

      if (!apiObject.documentation || !apiObject.documentation.parameters) {
        throw new Error('documentation.parameters is required');
      }

      res.json({
        success: true,
        api: apiObject,
        message: 'API generated successfully',
        context: {
          usedCommonPrompt: !!folder.commonPrompt,
          entitiesFound: diagram ? diagram.entities.length : 0
        }
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
    console.error('API Generation Error:', error);

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
        message: 'Failed to generate API',
        details: error.message
      });
    }
  }
};
// const generateAPI = async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     if (!prompt) {
//       return res.status(400).json({
//         error: 'Prompt is required'
//       });
//     }

//     const systemPrompt = `You are an expert backend API generator. Based on the user's description, generate a single REST API definition in the following JSON format:

// {
//   "name": "Get User Profile",
//   "description": "Retrieve user profile information by user ID",
//   "method": "GET", // One of: GET, POST, PUT, DELETE, PATCH
//   "endpoint": "/users/:id/profile",
//   "controllerCode": "async function controller(req, res) { ... }", // Use try-catch and return success, error properly
//   "testCases": [
//     {
//       "name": "Test name",
//       "input": {
//         "params": { "id": "123" },
//         "query": {},
//         "body": {}
//       },
//       "expectedOutput": {
//         "response": {
//           "success": true,
//           "data": { ... },
//           "message": "..."
//         }
//       },
//       "description": "What this test case checks"
//     }
//   ],
//   "documentation": {
//     "summary": "Short summary of what this API does",
//     "parameters": [
//       {
//         "name": "id",
//         "type": "string",
//         "required": true,
//         "description": "User ID",
//         "location": "params"
//       }
//     ]
//   }
// }

// Rules:
// - Format everything in valid JSON only.
// - Do not include markdown (no triple backticks).
// - controllerCode must be in raw JS (no string escapes).
// - All fields must be present as shown.
// - Follow RESTful best practices.
// - Use lowercase route naming convention.

// Note: only give one testcase for success only just the inputs for as per given example
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: systemPrompt,
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: 0.3,
//       max_tokens: 2000,
//     });

//     let responseContent = completion.choices[0].message.content;
//     responseContent = responseContent.replace(/^```(?:json)?|```$/g, '').trim();

//     try {
//       const apiObject = JSON.parse(responseContent);

//       const requiredFields = ['name', 'method', 'endpoint', 'controllerCode', 'testCases', 'documentation'];
//       const isValid = requiredFields.every(field => apiObject.hasOwnProperty(field));

//       if (!isValid) {
//         throw new Error('Missing required fields in the generated API');
//       }

//       res.json({
//         success: true,
//         api: apiObject,
//         message: 'API generated successfully'
//       });

//     } catch (parseError) {
//       console.error('Failed to parse OpenAI response:', parseError);
//       res.status(500).json({
//         error: 'Failed to parse AI response',
//         details: parseError.message,
//         raw: responseContent
//       });
//     }

//   } catch (error) {
//     console.error('OpenAI API Error:', error);

//     if (error.code === 'insufficient_quota') {
//       res.status(429).json({
//         error: 'OpenAI API quota exceeded',
//         message: 'Please check your OpenAI API usage and billing.'
//       });
//     } else if (error.code === 'invalid_api_key') {
//       res.status(401).json({
//         error: 'Invalid OpenAI API key',
//         message: 'Please check your OpenAI API key configuration.'
//       });
//     } else {
//       res.status(500).json({
//         error: 'Internal server error',
//         message: 'Failed to generate API'
//       });
//     }
//   }
// };

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
  generateAPI
};