const OpenAI = require('openai');

const Folder = require('../models/Folder');
const Diagram = require('../models/Diagram');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// // 1. Controller to generate API suggestions only
// const generateAPISuggestions = async (req, res) => {
//   try {
//     const { folderName, folderDescription, commonPrompt, projectId } = req.body;
    
//     console.log('=== GENERATE API SUGGESTIONS DEBUG ===');
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
    
//     // Validate required fields
//     if (!folderName) {
//       return res.status(400).json({
//         success: false,
//         error: 'Folder name is required'
//       });
//     }

//     if (!projectId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Project ID is required'
//       });
//     }

//     // Fetch diagram entities for context
//     const diagram = await Diagram.findOne({ projectId: projectId });
//     let entitiesContext = '';
    
//     if (diagram && diagram.entities && diagram.entities.length > 0) {
//       const entitiesInfo = diagram.entities.map(entity => {
//         const attributes = entity.attributes.map(attr => 
//           `${attr.name}: ${attr.type}${attr.unique ? ' (unique)' : ''}${attr.ref ? ` (ref: ${attr.ref})` : ''}`
//         ).join(', ');
        
//         return `${entity.name} { ${attributes} }`;
//       }).join('\n');

//       entitiesContext = `\n\nDatabase Entities Context:
// The following entities are available in the database schema:
// ${entitiesInfo}

// Please consider these entities when suggesting APIs and use appropriate relationships where applicable.`;
//     }

//     const systemPrompt = `You are an expert backend API architect. Based on the folder information and database context, suggest a comprehensive list of REST API endpoints that would be commonly needed.

// Generate a JSON response with an array of API suggestions in the following format:

// {
//   "suggestions": [
//     {
//       "name": "Get All Users",
//       "description": "Retrieve all users with pagination",
//       "method": "GET",
//       "endpoint": "/users",
//       "category": "User Management"
//     },
//     {
//       "name": "Create User",
//       "description": "Create a new user account",
//       "method": "POST",
//       "endpoint": "/users",
//       "category": "User Management"
//     }
//   ]
// }

// Rules:
// - Format everything in valid JSON only.
// - Do not include markdown (no triple backticks).
// - Suggest 8-15 relevant API endpoints based on the folder context.
// - Include CRUD operations for main entities.
// - Follow RESTful best practices.
// - Use lowercase route naming convention.
// - Consider the database entities provided for proper data modeling.
// - Group related APIs by category.
// - Make suggestions practical and commonly used.
// - Include authentication, validation, and business logic APIs where appropriate.

// Categories can include: User Management, Authentication, Data Management, Reports, Configuration, etc.

// ${commonPrompt ? `\nCommon Instructions: ${commonPrompt}` : ''}${entitiesContext}`;

//     const userPrompt = `Folder Name: ${folderName}
// ${folderDescription ? `Folder Description: ${folderDescription}` : ''}

// Please suggest relevant REST API endpoints for this folder context.`;

//     // Generate suggestions using OpenAI
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: systemPrompt,
//         },
//         {
//           role: "user",
//           content: userPrompt,
//         },
//       ],
//       temperature: 0.3,
//       max_tokens: 2000,
//     });

//     let responseContent = completion.choices[0].message.content;
//     responseContent = responseContent.replace(/^```(?:json)?|```$/g, '').trim();

//     let suggestionsObject;
//     try {
//       suggestionsObject = JSON.parse(responseContent);

//       // Validate the structure
//       if (!suggestionsObject.suggestions || !Array.isArray(suggestionsObject.suggestions)) {
//         throw new Error('Invalid response format: suggestions array is required');
//       }

//       // Validate each suggestion
//       const requiredFields = ['name', 'method', 'endpoint'];
//       const isValid = suggestionsObject.suggestions.every(suggestion => 
//         requiredFields.every(field => suggestion.hasOwnProperty(field))
//       );

//       if (!isValid) {
//         throw new Error('Missing required fields in suggestions');
//       }

//     } catch (parseError) {
//       console.error('Failed to parse OpenAI response:', parseError);
//       return res.status(500).json({
//         success: false,
//         error: 'Failed to parse AI response',
//         details: parseError.message,
//         raw: responseContent
//       });
//     }

//     // Format suggestions for consistent structure
//     const formattedSuggestions = suggestionsObject.suggestions.map((suggestion, index) => ({
//       id: index,
//       name: suggestion.name.trim(),
//       description: suggestion.description || '',
//       method: suggestion.method.toUpperCase(),
//       endpoint: suggestion.endpoint.trim(),
//       category: suggestion.category || 'General'
//     }));

//     return res.json({
//       success: true,
//       suggestions: formattedSuggestions,
//       message: 'API suggestions generated successfully',
//       context: {
//         folderName,
//         folderDescription: folderDescription || null,
//         usedCommonPrompt: !!commonPrompt,
//         entitiesFound: diagram ? diagram.entities.length : 0,
//         totalSuggestions: formattedSuggestions.length
//       }
//     });

//   } catch (error) {
//     console.error('API Suggestions Generation Error:', error);

//     if (error.code === 'insufficient_quota') {
//       res.status(429).json({
//         success: false,
//         error: 'OpenAI API quota exceeded',
//         message: 'Please check your OpenAI API usage and billing.'
//       });
//     } else if (error.code === 'invalid_api_key') {
//       res.status(401).json({
//         success: false,
//         error: 'Invalid OpenAI API key',
//         message: 'Please check your OpenAI API key configuration.'
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error',
//         message: 'Failed to generate API suggestions',
//         details: error.message
//       });
//     }
//   }
// };

// // 2. Controller to get API suggestions by names (for selection)
// const getAPISuggestionsByNames = async (req, res) => {
//   try {
//     const { folderName, folderDescription, commonPrompt, projectId, selectedNames } = req.body;
    
//     console.log('=== GET API SUGGESTIONS BY NAMES DEBUG ===');
//     console.log('Selected names:', selectedNames);
    
//     // Validate required fields
//     if (!selectedNames || !Array.isArray(selectedNames) || selectedNames.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Selected API names array is required'
//       });
//     }

//     // First generate all suggestions to filter from
//     const allSuggestions = await generateAllSuggestions(folderName, folderDescription, commonPrompt, projectId);
    
//     // Filter suggestions by selected names
//     const selectedSuggestions = allSuggestions.filter(suggestion => 
//       selectedNames.includes(suggestion.name)
//     );

//     if (selectedSuggestions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: 'No matching API suggestions found for the provided names'
//       });
//     }

//     return res.json({
//       success: true,
//       selectedSuggestions,
//       message: `${selectedSuggestions.length} API suggestions retrieved successfully`,
//       context: {
//         totalRequested: selectedNames.length,
//         totalFound: selectedSuggestions.length,
//         folderName
//       }
//     });

//   } catch (error) {
//     console.error('Get API Suggestions By Names Error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error',
//       message: 'Failed to retrieve API suggestions by names',
//       details: error.message
//     });
//   }
// };

// // 3. Controller to create APIs from selected suggestions
// const createAPIsFromSuggestions = async (req, res) => {
//   try {
//     const { 
//       folderId, 
//       projectId, 
//       selectedSuggestions, 
//       commonPrompt,
//       createAll = false 
//     } = req.body;
    
//     console.log('=== CREATE APIs FROM SUGGESTIONS DEBUG ===');
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
//     console.log('User ID from token:', req.userId);
    
//     // Validate required fields
//     if (!folderId || !folderId.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Valid folder ID is required'
//       });
//     }

//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         error: 'User not authenticated'
//       });
//     }

//     if (!selectedSuggestions || !Array.isArray(selectedSuggestions) || selectedSuggestions.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Selected suggestions array is required'
//       });
//     }

//     // Fetch diagram entities for context
//     const diagram = await Diagram.findOne({ projectId: projectId });
//     let entitiesContext = '';
    
//     if (diagram && diagram.entities && diagram.entities.length > 0) {
//       const entitiesInfo = diagram.entities.map(entity => {
//         const attributes = entity.attributes.map(attr => 
//           `${attr.name}: ${attr.type}${attr.unique ? ' (unique)' : ''}${attr.ref ? ` (ref: ${attr.ref})` : ''}`
//         ).join(', ');
        
//         return `${entity.name} { ${attributes} }`;
//       }).join('\n');

//       entitiesContext = `\n\nDatabase Entities Context:
// The following entities are available in the database schema:
// ${entitiesInfo}

// Please consider these entities when suggesting APIs and use appropriate relationships where applicable.`;
//     }

//     // Find the folder
//     console.log('Finding folder with ID:', folderId, 'for user:', req.userId);

//     const folder = await Folder.findOne({
//       _id: folderId,
//       userId: req.userId
//     });

//     console.log('Folder found:', folder ? 'Yes' : 'No');

//     if (!folder) {
//       return res.status(404).json({
//         success: false,
//         message: 'Folder not found or access denied'
//       });
//     }

//     // Create APIs from suggestions
//     const createdApis = [];
//     const skippedApis = [];
//     const errors = [];

//     for (const suggestion of selectedSuggestions) {
//       try {
//         // Check for duplicate endpoint in the same folder
//         const methodUpper = suggestion.method.toUpperCase();
//         const existingApi = folder.apis.find(
//           api => api.method === methodUpper && api.endpoint === suggestion.endpoint
//         );

//         if (existingApi) {
//           skippedApis.push({
//             suggestion,
//             reason: `API endpoint ${methodUpper} ${suggestion.endpoint} already exists`
//           });
//           continue;
//         }

//         // Generate complete API using OpenAI
//         const apiGenerationPrompt = `You are an expert backend API generator. Based on the API suggestion, generate a complete REST API definition in the following JSON format:

// {
//   "name": "${suggestion.name}",
//   "description": "${suggestion.description}",
//   "method": "${suggestion.method}",
//   "endpoint": "${suggestion.endpoint}",
//   "controllerCode": "async function controller(req, res) { ... }",
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
//         "description": "Parameter description",
//         "location": "params"
//       }
//     ]
//   }
// }

// Rules:
// - Format everything in valid JSON only.
// - Do not include markdown (no triple backticks).
// - controllerCode must be complete, functional JavaScript code.
// - Include proper error handling with try-catch blocks.
// - Use appropriate HTTP status codes.
// - Follow RESTful best practices.
// - Consider the database entities provided for proper data modeling.
// - Only give one test case for success scenario.
// - Make the API production-ready with proper validation.

// ${folder.commonPrompt ? `\nCommon Instructions: ${folder.commonPrompt}` : ''}${entitiesContext}`;

//         const apiCompletion = await openai.chat.completions.create({
//           model: "gpt-4o",
//           messages: [
//             {
//               role: "system",
//               content: apiGenerationPrompt,
//             },
//             {
//               role: "user",
//               content: `Generate a complete API for: ${suggestion.name} - ${suggestion.description}`,
//             },
//           ],
//           temperature: 0.3,
//           max_tokens: 2500,
//         });

//         let apiResponseContent = apiCompletion.choices[0].message.content;
//         apiResponseContent = apiResponseContent.replace(/^```(?:json)?|```$/g, '').trim();

//         let apiObject;
//         try {
//           apiObject = JSON.parse(apiResponseContent);
          
//           // Validate the generated API structure
//           const requiredApiFields = ['name', 'method', 'endpoint', 'controllerCode', 'testCases', 'documentation'];
//           const isValidApi = requiredApiFields.every(field => apiObject.hasOwnProperty(field));

//           if (!isValidApi) {
//             throw new Error('Missing required fields in the generated API');
//           }

//           // Validate test cases structure
//           if (!Array.isArray(apiObject.testCases) || apiObject.testCases.length === 0) {
//             throw new Error('testCases must be a non-empty array');
//           }

//           // Validate documentation structure
//           if (!apiObject.documentation || !apiObject.documentation.parameters) {
//             throw new Error('documentation.parameters is required');
//           }

//         } catch (apiParseError) {
//           console.error(`Failed to parse API generation for ${suggestion.name}:`, apiParseError);
//           // Fallback to basic template if AI generation fails
//           apiObject = {
//             name: suggestion.name,
//             description: suggestion.description,
//             method: suggestion.method,
//             endpoint: suggestion.endpoint,
//             controllerCode: `async function ${suggestion.name.replace(/\s+/g, '')}Controller(req, res) {
//   try {
//     // TODO: Implement ${suggestion.name} logic
//     res.json({
//       success: true,
//       message: '${suggestion.name} executed successfully',
//       data: {}
//     });
//   } catch (error) {
//     console.error('Error in ${suggestion.name}:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// }`,
//             testCases: [{
//               name: `Test ${suggestion.name}`,
//               input: {
//                 params: {},
//                 query: {},
//                 body: {}
//               },
//               expectedOutput: {
//                 response: {
//                   success: true,
//                   message: `${suggestion.name} executed successfully`,
//                   data: {}
//                 }
//               },
//               description: `Test case for ${suggestion.name}`
//             }],
//             documentation: {
//               summary: suggestion.description || '',
//               parameters: []
//             }
//           };
//         }

//         const controllerCode = apiObject.controllerCode;
//         const testCases = apiObject.testCases;

//         // Create new API object with generated content
//         const newApi = {
//           name: apiObject.name.trim(),
//           description: apiObject.description || '',
//           method: apiObject.method.toUpperCase(),
//           endpoint: apiObject.endpoint.trim(),
//           controllerCode: controllerCode,
//           testCases: testCases,
//           documentation: {
//             summary: apiObject.documentation.summary || apiObject.description || '',
//             parameters: Array.isArray(apiObject.documentation.parameters) ? apiObject.documentation.parameters : []
//           },
//           category: suggestion.category || 'General'
//         };

//         // Add the new API to the folder
//         folder.apis.push(newApi);
        
//         // Get the created API (the last one added)
//         const createdApi = folder.apis[folder.apis.length - 1];
        
//         createdApis.push({
//           _id: createdApi._id,
//           name: createdApi.name,
//           description: createdApi.description,
//           method: createdApi.method,
//           endpoint: createdApi.endpoint,
//           controllerCode: createdApi.controllerCode,
//           testCases: createdApi.testCases,
//           documentation: createdApi.documentation,
//           category: createdApi.category
//         });

//       } catch (error) {
//         console.error(`Error creating API for ${suggestion.name}:`, error);
//         errors.push({
//           suggestion,
//           error: error.message
//         });
//       }
//     }

//     // Save the folder if any APIs were created
//     if (createdApis.length > 0) {
//       await folder.save();
//       console.log('Folder saved successfully with new APIs');
//     }

//     // Return comprehensive response
//     res.status(201).json({
//       success: true,
//       message: `${createdApis.length} APIs created successfully from suggestions`,
//       data: {
//         created: createdApis,
//         skipped: skippedApis,
//         errors: errors
//       },
//       summary: {
//         created: createdApis.length,
//         skipped: skippedApis.length,
//         failed: errors.length
//       }
//     });

//   } catch (error) {
//     console.error('API Creation Error:', error);

//     if (error.code === 'insufficient_quota') {
//       res.status(429).json({
//         success: false,
//         error: 'OpenAI API quota exceeded',
//         message: 'Please check your OpenAI API usage and billing.'
//       });
//     } else if (error.code === 'invalid_api_key') {
//       res.status(401).json({
//         success: false,
//         error: 'Invalid OpenAI API key',
//         message: 'Please check your OpenAI API key configuration.'
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error',
//         message: 'Failed to create APIs from suggestions',
//         details: error.message
//       });
//     }
//   }
// };
// 1. Controller to generate API suggestions only
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

// 2. Merged Controller to create API from a single suggestion name
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

    // COMMENTED FOR TESTING - Remove these comments when ready for production
    /*
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

    // Check for duplicate endpoint in the same folder
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

    // Generate complete API using OpenAI
    const apiGenerationPrompt = `You are an expert backend API generator. Based on the API suggestion, generate a complete REST API definition in the following JSON format:

{
  "name": "${matchingSuggestion.name}",
  "description": "${matchingSuggestion.description}",
  "method": "${matchingSuggestion.method}",
  "endpoint": "${matchingSuggestion.endpoint}",
  "controllerCode": "async function controller(req, res) { ... }",
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
- Include proper error handling with try-catch blocks.
- Use appropriate HTTP status codes.
- Follow RESTful best practices.
- Consider the database entities provided for proper data modeling.
- Only give one test case for success scenario.
- Make the API production-ready with proper validation.

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
      
      // Validate the generated API structure
      const requiredApiFields = ['name', 'method', 'endpoint', 'controllerCode', 'testCases', 'documentation'];
      const isValidApi = requiredApiFields.every(field => apiObject.hasOwnProperty(field));

      if (!isValidApi) {
        throw new Error('Missing required fields in the generated API');
      }

      // Validate test cases structure
      if (!Array.isArray(apiObject.testCases) || apiObject.testCases.length === 0) {
        throw new Error('testCases must be a non-empty array');
      }

      // Validate documentation structure
      if (!apiObject.documentation || !apiObject.documentation.parameters) {
        throw new Error('documentation.parameters is required');
      }

    } catch (apiParseError) {
      console.error(`Failed to parse API generation for ${matchingSuggestion.name}:`, apiParseError);
      // Fallback to basic template if AI generation fails
      apiObject = {
        name: matchingSuggestion.name,
        description: matchingSuggestion.description,
        method: matchingSuggestion.method,
        endpoint: matchingSuggestion.endpoint,
        controllerCode: `async function ${matchingSuggestion.name.replace(/\s+/g, '')}Controller(req, res) {
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
    */

    // TESTING EXAMPLE - Remove this when uncommenting the above OpenAI code
    apiObject = {
      name: suggestionName,
      description: `Generated API for ${suggestionName}`,
      method: "GET",
      endpoint: `/api/${suggestionName.toLowerCase().replace(/\s+/g, '-')}`,
      controllerCode: `async function ${suggestionName.replace(/\s+/g, '')}Controller(req, res) {
  try {
    // TODO: Implement ${suggestionName} logic
    res.json({
      success: true,
      message: '${suggestionName} executed successfully',
      data: {
        example: 'This is a test API response',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in ${suggestionName}:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}`,
      testCases: [{
        name: `Test ${suggestionName}`,
        input: {
          params: {},
          query: {},
          body: {}
        },
        expectedOutput: {
          response: {
            success: true,
            message: `${suggestionName} executed successfully`,
            data: {
              example: 'This is a test API response',
              timestamp: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        description: `Test case for ${suggestionName}`
      }],
      documentation: {
        summary: `Generated API for ${suggestionName}`,
        parameters: []
      }
    };

    // Check for duplicate endpoint in the same folder
    const methodUpper = apiObject.method.toUpperCase();
    const existingApi = folder.apis.find(
      api => api.method === methodUpper && api.endpoint === apiObject.endpoint
    );

    if (existingApi) {
      return res.status(409).json({
        success: false,
        error: `API endpoint ${methodUpper} ${apiObject.endpoint} already exists in this folder`
      });
    }

    // Create new API object with generated content
    const newApi = {
      name: apiObject.name.trim(),
      description: apiObject.description || '',
      method: apiObject.method.toUpperCase(),
      endpoint: apiObject.endpoint.trim(),
      controllerCode: apiObject.controllerCode,
      testCases: apiObject.testCases,
      documentation: {
        summary: apiObject.documentation.summary || apiObject.description || '',
        parameters: Array.isArray(apiObject.documentation.parameters) ? apiObject.documentation.parameters : []
      },
      category: apiObject.category || 'General'
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
        testCases: createdApi.testCases,
        documentation: createdApi.documentation,
        category: createdApi.category
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

// Helper function to generate all suggestions (used internally)
const generateAllSuggestions = async (folderName, folderDescription, commonPrompt, projectId) => {
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

${commonPrompt ? `\nCommon Instructions: ${commonPrompt}` : ''}${entitiesContext}`;

  const userPrompt = `Folder Name: ${folderName}
${folderDescription ? `Folder Description: ${folderDescription}` : ''}

Please suggest relevant REST API endpoints for this folder context.`;

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

  const suggestionsObject = JSON.parse(responseContent);
  
  return suggestionsObject.suggestions.map(suggestion => ({
    name: suggestion.name.trim(),
    description: suggestion.description || '',
    method: suggestion.method.toUpperCase(),
    endpoint: suggestion.endpoint.trim(),
    category: suggestion.category || 'General'
  }));
};

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
  generateAPI,
  generateAPISuggestions,
  createAPIFromSuggestionName
};