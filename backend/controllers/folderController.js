const Folder = require('../models/Folder');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
// FOLDER CRUD OPERATIONS

// Create new folder
const createFolder = async (req, res) => {
  try {
    const { name, description, projectId , commonPrompt } = req.body;
    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Check if folder name already exists in project
    const existingFolder = await Folder.findOne({
      name,
      projectId,
      userId: req.userId
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'Folder with this name already exists in the project'
      });
    }

    const folder = new Folder({
      name,
      description,
      projectId,
      userId: req.userId,
      apis: [],
      commonPrompt 
    });

    await folder.save();

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: folder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating folder',
      error: error.message
    });
  }
};

// Get all folders by project
const getFoldersByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    const folders = await Folder.find({
      projectId,
      userId: req.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: folders,
      count: folders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching folders',
      error: error.message
    });
  }
};

// Get specific folder with APIs
const getFolderById = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.userId
    }).populate('projectId', 'name description');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    res.json({
      success: true,
      data: folder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching folder',
      error: error.message
    });
  }
};

// Update folder
const updateFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name, description, commonPrompt } = req.body;

    // Check for name conflict only if name is provided and changed
    if (name) {
      const folder = await Folder.findById(folderId);
      if (folder && folder.name !== name) {
        const existingFolder = await Folder.findOne({
          name,
          projectId: folder.projectId,
          userId: req.userId,
          _id: { $ne: folderId }
        });

        if (existingFolder) {
          return res.status(400).json({
            success: false,
            message: 'Folder with this name already exists in the project'
          });
        }
      }
    }

    // Dynamically build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (commonPrompt !== undefined) updateData.commonPrompt = commonPrompt;

    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Folder updated successfully',
      data: folder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating folder',
      error: error.message
    });
  }
};


// Delete folder
const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findOneAndDelete({
      _id: folderId,
      userId: req.userId
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting folder',
      error: error.message
    });
  }
};

// API CRUD OPERATIONS WITHIN FOLDERS

// Create API in folder
// const createApi = async (req, res) => {
//   try {
//     console.log('=== CREATE API DEBUG ===');
//     console.log('Request params:', req.params);
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
//     console.log('User ID from token:', req.userId);

//     const { folderId } = req.params;
//     const {
//       name,
//       description,
//       method,
//       endpoint,
//       controllerCode,
//       testCases,
//       documentation
//     } = req.body;

//     // Validate required fields
//     if (!name || !method || !endpoint || !controllerCode) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: name, method, endpoint, or controllerCode'
//       });
//     }

//     // Validate folderId format
//     if (!folderId || !folderId.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid folder ID format'
//       });
//     }

//     // Check if user is authenticated
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not authenticated'
//       });
//     }

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

//     // Check for duplicate endpoint in the same folder
//     const methodUpper = method.toUpperCase();
//     const existingApi = folder.apis.find(
//       api => api.method === methodUpper && api.endpoint === endpoint
//     );

//     if (existingApi) {
//       return res.status(400).json({
//         success: false,
//         message: `API endpoint ${methodUpper} ${endpoint} already exists in this folder`
//       });
//     }

//     // Create new API object with proper structure
//     const newApi = {
//       name: name.trim(),
//       description: description || '',
//       method: methodUpper,
//       endpoint: endpoint.trim(),
//       controllerCode,
//       testCases: Array.isArray(testCases) ? testCases : [],
//       documentation: {
//         summary: documentation?.summary || '',
//         parameters: Array.isArray(documentation?.parameters) ? documentation.parameters : []
//       }
//     };

//     console.log('New API object:', JSON.stringify(newApi, null, 2));

//     // Add the new API to the folder
//     folder.apis.push(newApi);
    
//     // Get the created API (the last one added)
//     const createdApi = folder.apis[folder.apis.length - 1];
    
//     console.log('API added to folder, total APIs:', folder.apis.length);
    
//     // Save the folder
//     const savedFolder = await folder.save();
//     console.log('Folder saved successfully');

//     res.status(201).json({
//       success: true,
//       message: 'API created successfully',
//       data: {
//         _id: createdApi._id,
//         name: createdApi.name,
//         description: createdApi.description,
//         method: createdApi.method,
//         endpoint: createdApi.endpoint,
//         controllerCode: createdApi.controllerCode,
//         testCases: createdApi.testCases,
//         documentation: createdApi.documentation
//       }
//     });

//   } catch (error) {
//     console.error('Error creating API:', error);
//     console.error('Error stack:', error.stack);
    
//     // Handle specific MongoDB errors
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         errors: validationErrors
//       });
//     }

//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid ID format'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Error creating API',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// };

// Helper function to validate MongoDB ObjectId
// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to validate test cases structure
const validateTestCases = (testCases) => {
  if (!Array.isArray(testCases)) return { valid: false, error: 'Test cases must be an array' };
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    if (!testCase.name || typeof testCase.name !== 'string') {
      return { valid: false, error: `Test case ${i + 1}: name is required and must be a string` };
    }
    
    if (!testCase.expectedOutput || !testCase.expectedOutput.response) {
      return { valid: false, error: `Test case ${i + 1}: expectedOutput.response is required` };
    }
  }
  
  return { valid: true };
};

// Helper function to validate documentation parameters
const validateDocumentationParams = (parameters) => {
  if (!Array.isArray(parameters)) return { valid: false, error: 'Documentation parameters must be an array' };
  
  const validLocations = ['query', 'body', 'params', 'headers'];
  
  for (let i = 0; i < parameters.length; i++) {
    const param = parameters[i];
    
    if (!param.name || typeof param.name !== 'string') {
      return { valid: false, error: `Parameter ${i + 1}: name is required and must be a string` };
    }
    
    if (!param.type || typeof param.type !== 'string') {
      return { valid: false, error: `Parameter ${i + 1}: type is required and must be a string` };
    }
    
    if (param.location && !validLocations.includes(param.location)) {
      return { valid: false, error: `Parameter ${i + 1}: location must be one of: ${validLocations.join(', ')}` };
    }
  }
  
  return { valid: true };
};

// const createApi = async (req, res) => {
//   try {
//     console.log('=== CREATE API DEBUG ===');
//     console.log('Request params:', req.params);
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
//     console.log('User ID from token:', req.userId);

//     const { folderId } = req.params;
//     const {
//       name,
//       description,
//       method,
//       endpoint,
//       controllerCode,
//       controllerName,
//       imports = [],
//       testCases = [],
//       documentation = {}
//     } = req.body;

//     // Validate authentication
//     if (!req.userId) {
//       console.log('❌ Authentication failed: No user ID');
//       return res.status(401).json({
//         success: false,
//         message: 'User not authenticated'
//       });
//     }

//     // Validate folderId format
//     if (!folderId) {
//       console.log('❌ Validation failed: Missing folder ID');
//       return res.status(400).json({
//         success: false,
//         message: 'Folder ID is required'
//       });
//     }

//     if (!isValidObjectId(folderId)) {
//       console.log('❌ Validation failed: Invalid folder ID format:', folderId);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid folder ID format. Must be a valid MongoDB ObjectId'
//       });
//     }

//     // Validate required fields
//     const requiredFields = { name, method, endpoint, controllerCode, controllerName };
//     const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
    
//     if (missingFields.length > 0) {
//       console.log('❌ Validation failed: Missing required fields:', missingFields);
//       return res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(', ')}`
//       });
//     }

//     // Validate method
//     const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
//     const methodUpper = method.toUpperCase();
    
//     if (!validMethods.includes(methodUpper)) {
//       console.log('❌ Validation failed: Invalid HTTP method:', method);
//       return res.status(400).json({
//         success: false,
//         message: `Invalid HTTP method. Must be one of: ${validMethods.join(', ')}`
//       });
//     }

//     // Validate endpoint format
//     const trimmedEndpoint = endpoint.trim();
//     if (!trimmedEndpoint.startsWith('/')) {
//       console.log('❌ Validation failed: Endpoint must start with /', trimmedEndpoint);
//       return res.status(400).json({
//         success: false,
//         message: 'Endpoint must start with forward slash (/)'
//       });
//     }

//     // Validate test cases if provided
//     if (testCases && testCases.length > 0) {
//       const testCaseValidation = validateTestCases(testCases);
//       if (!testCaseValidation.valid) {
//         console.log('❌ Test case validation failed:', testCaseValidation.error);
//         return res.status(400).json({
//           success: false,
//           message: `Test case validation error: ${testCaseValidation.error}`
//         });
//       }
//     }

//     // Validate documentation parameters if provided
//     if (documentation.parameters && documentation.parameters.length > 0) {
//       const docValidation = validateDocumentationParams(documentation.parameters);
//       if (!docValidation.valid) {
//         console.log('❌ Documentation validation failed:', docValidation.error);
//         return res.status(400).json({
//           success: false,
//           message: `Documentation validation error: ${docValidation.error}`
//         });
//       }
//     }

//     // Find the folder
//     console.log('🔍 Finding folder with ID:', folderId, 'for user:', req.userId);

//     const folder = await Folder.findOne({
//       _id: folderId,
//       userId: req.userId
//     });

//     console.log('📁 Folder found:', folder ? 'Yes' : 'No');

//     if (!folder) {
//       console.log('❌ Folder not found or access denied');
//       return res.status(404).json({
//         success: false,
//         message: 'Folder not found or access denied'
//       });
//     }

//     // Check for duplicate endpoint in the same folder
//     const existingApi = folder.apis.find(
//       api => api.method === methodUpper && api.endpoint === trimmedEndpoint
//     );

//     if (existingApi) {
//       console.log('❌ Duplicate endpoint found:', methodUpper, trimmedEndpoint);
//       return res.status(400).json({
//         success: false,
//         message: `API endpoint ${methodUpper} ${trimmedEndpoint} already exists in this folder`
//       });
//     }

//     // Process imports - merge with existing folder imports
//     const processedImports = [];
//     const existingImports = folder.imports || [];
    
//     // Add new imports, avoiding duplicates
//     if (Array.isArray(imports)) {
//       imports.forEach(newImport => {
//         // Validate import structure
//         if (!newImport.module || typeof newImport.module !== 'string') {
//           console.log('⚠️ Skipping invalid import - missing module:', newImport);
//           return;
//         }

//         const exists = existingImports.find(
//           existing => existing.module === newImport.module && existing.type === newImport.type
//         );
        
//         if (!exists) {
//           processedImports.push({
//             module: newImport.module,
//             type: newImport.type || 'npm',
//             version: newImport.version || 'latest'
//           });
//         }
//       });
//     }

//     // Process test cases with proper structure
//     const processedTestCases = testCases.map(testCase => ({
//       name: testCase.name.trim(),
//       input: {
//         params: testCase.input?.params || {},
//         query: testCase.input?.query || {},
//         body: testCase.input?.body || {}
//       },
//       expectedOutput: {
//         response: testCase.expectedOutput.response
//       },
//       description: testCase.description || ''
//     }));

//     // Process documentation with proper structure
//     const processedDocumentation = {
//       summary: documentation.summary || '',
//       parameters: (documentation.parameters || []).map(param => ({
//         name: param.name.trim(),
//         type: param.type.trim(),
//         required: Boolean(param.required),
//         description: param.description || '',
//         location: param.location || 'body'
//       }))
//     };

//     // Clean and validate controllerCode format
//     let cleanedControllerCode = controllerCode.trim();
    
//     // If controllerCode starts with exports.functionName, extract just the function
//     const exportsMatch = cleanedControllerCode.match(/^exports\.(\w+)\s*=\s*(.+)$/s);
//     if (exportsMatch) {
//       const [, exportedName, functionCode] = exportsMatch;
//       // Use the exported name as controllerName if it matches
//       if (exportedName === controllerName.trim()) {
//         cleanedControllerCode = `const ${controllerName.trim()} = ${functionCode}`;
//       }
//     }

//     // Create new API object with proper structure
//     const newApi = {
//       name: name.trim(),
//       description: description || '',
//       method: methodUpper,
//       endpoint: trimmedEndpoint,
//       controllerCode: cleanedControllerCode,
//       controllerName: controllerName.trim(),
//       testCases: processedTestCases,
//       documentation: processedDocumentation
//     };

//     console.log('✅ New API object created:', {
//       name: newApi.name,
//       method: newApi.method,
//       endpoint: newApi.endpoint,
//       controllerName: newApi.controllerName,
//       testCasesCount: newApi.testCases.length,
//       parametersCount: newApi.documentation.parameters.length
//     });

//     // Store API data for response (before any modifications)
//     const responseApiData = {
//       name: newApi.name,
//       description: newApi.description,
//       method: newApi.method,
//       endpoint: newApi.endpoint,
//       controllerCode: newApi.controllerCode,
//       controllerName: newApi.controllerName,
//       testCases: newApi.testCases,
//       documentation: newApi.documentation
//     };

//     // Add the new API to the folder
//     folder.apis.push(newApi);
    
//     // Add new imports to folder
//     if (processedImports.length > 0) {
//       folder.imports.push(...processedImports);
//       console.log('📦 Added', processedImports.length, 'new imports');
//     }
    
//     console.log('📊 API added to folder, total APIs:', folder.apis.length);

//     // Validate all APIs in the folder before saving (ensure backward compatibility)
//     folder.apis.forEach((api, index) => {
//       // Ensure all required fields are present
//       if (!api.name) api.name = `API ${index + 1}`;
//       if (!api.method) api.method = 'GET';
//       if (!api.endpoint) api.endpoint = `/api/${index + 1}`;
//       if (!api.controllerCode) api.controllerCode = `const defaultController${index + 1} = (req, res) => { res.json({ message: 'Default response' }); }`;
//       if (!api.controllerName) {
//         // Generate a default controllerName from the API name or method+endpoint
//         const defaultName = api.name 
//           ? api.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
//           : `${api.method.toLowerCase()}${api.endpoint.replace(/[^a-zA-Z0-9]/g, '')}`;
        
//         api.controllerName = defaultName || `defaultController${index + 1}`;
//         console.log(`🔧 Fixed missing controllerName for API ${index}: ${api.controllerName}`);
//       }
      
//       // Ensure testCases is an array
//       if (!Array.isArray(api.testCases)) {
//         api.testCases = [];
//       }
      
//       // Ensure documentation exists
//       if (!api.documentation) {
//         api.documentation = {
//           summary: '',
//           parameters: []
//         };
//       }
      
//       // Ensure parameters is an array
//       if (!Array.isArray(api.documentation.parameters)) {
//         api.documentation.parameters = [];
//       }
//     });

//     // Generate file names for tracking
//     const folderName = folder.name.replace(/[^a-zA-Z0-9]/g, ''); // Remove special characters
//     const controllerFileName = `${folderName}Controller.js`;
//     const routeFileName = `${folderName}Routes.js`;

//     // Generate raw controller code (no imports, no module.exports)
//     const generateControllerCode = () => {
//       try {
//         const controllerFunctions = folder.apis
//           .map(api => `exports.${api.controllerName} = ${api.controllerCode.replace(/^const\s+\w+\s*=\s*/, '')};`)
//           .join('\n\n');
        
//         return controllerFunctions;
//       } catch (error) {
//         console.error('Error generating controller code:', error);
//         throw new Error('Failed to generate controller code');
//       }
//     };

//     // Generate raw route code (no imports, no module.exports)
//     const generateRouteCode = () => {
//       try {
//         const routeStatements = folder.apis
//           .map(api => `router.${api.method.toLowerCase()}('${api.endpoint}', ${api.controllerName});`)
//           .join('\n');

//         return routeStatements;
//       } catch (error) {
//         console.error('Error generating route code:', error);
//         throw new Error('Failed to generate route code');
//       }
//     };

//     // Generate and store code
//     try {
//       console.log('🔧 Generating controller and route code...');
      
//       // Generate controller code
//       const controllerCode = generateControllerCode();
      
//       // Generate route code  
//       const routeCode = generateRouteCode();

//       // Generate content hashes for tracking changes
//       const controllerHash = crypto.createHash('md5').update(controllerCode).digest('hex');
//       const routeHash = crypto.createHash('md5').update(routeCode).digest('hex');

//       // Update folder with generated code information
//       folder.generatedFiles = {
//         controllerFile: {
//           path: controllerFileName,
//           code: controllerCode,
//           lastGenerated: new Date(),
//           hash: controllerHash
//         },
//         routeFile: {
//           path: routeFileName,
//           code: routeCode,
//           lastGenerated: new Date(),
//           hash: routeHash
//         }
//       };

//       console.log('✅ Code generated successfully:', {
//         controller: controllerFileName,
//         route: routeFileName,
//         controllerCodeLength: controllerCode.length,
//         routeCodeLength: routeCode.length
//       });

//     } catch (codeError) {
//       console.error('❌ Error generating code:', codeError);
//       return res.status(500).json({
//         success: false,
//         message: 'Error generating controller and route code',
//         error: codeError.message
//       });
//     }

//     // Save the folder
//     console.log('💾 Saving folder...');
//     const savedFolder = await folder.save();
//     console.log('✅ Folder saved successfully');

//     // Get the last API from saved folder for the _id
//     const lastSavedApi = savedFolder.apis[savedFolder.apis.length - 1];

//     // Send success response using stored data
//     res.status(201).json({
//       success: true,
//       message: 'API created successfully',
//       data: {
//         _id: lastSavedApi._id, // Use the MongoDB generated _id
//         name: responseApiData.name,
//         description: responseApiData.description,
//         method: responseApiData.method,
//         endpoint: responseApiData.endpoint,
//         controllerCode: responseApiData.controllerCode,
//         controllerName: responseApiData.controllerName,
//         testCases: responseApiData.testCases,
//         documentation: responseApiData.documentation
//       },
//       generatedFiles: {
//         controllerFile: {
//           name: controllerFileName,
//           codeLength: savedFolder.generatedFiles.controllerFile.code.length
//         },
//         routeFile: {
//           name: routeFileName,
//           codeLength: savedFolder.generatedFiles.routeFile.code.length
//         }
//       },
//       totalApis: savedFolder.apis.length,
//       totalImports: savedFolder.imports.length
//     });

//   } catch (error) {
//     console.error('❌ Error creating API:', error);
//     console.error('Error stack:', error.stack);
    
//     // Handle specific MongoDB errors
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       console.log('❌ MongoDB Validation Error:', validationErrors);
//       return res.status(400).json({
//         success: false,
//         message: 'Database validation error',
//         errors: validationErrors
//       });
//     }

//     if (error.name === 'CastError') {
//       console.log('❌ MongoDB Cast Error:', error.message);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid data format provided'
//       });
//     }

//     if (error.code === 11000) {
//       console.log('❌ MongoDB Duplicate Key Error:', error.message);
//       return res.status(400).json({
//         success: false,
//         message: 'Duplicate entry detected'
//       });
//     }

//     // Generic error response
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error occurred while creating API',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//     });
//   }
// };

// Get specific API from folder
const createApi = async (req, res) => {
  try {
    console.log('=== CREATE API DEBUG ===');
    console.log('Request params:', req.params);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID from token:', req.userId);

    const { folderId } = req.params;
    const {
      name,
      description,
      method,
      endpoint,
      controllerCode,
      controllerName,
      imports = [],
      testCases = [],
      documentation = {}
    } = req.body;

    // Validate authentication
    if (!req.userId) {
      console.log('❌ Authentication failed: No user ID');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate folderId format
    if (!folderId) {
      console.log('❌ Validation failed: Missing folder ID');
      return res.status(400).json({
        success: false,
        message: 'Folder ID is required'
      });
    }

    if (!isValidObjectId(folderId)) {
      console.log('❌ Validation failed: Invalid folder ID format:', folderId);
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID format. Must be a valid MongoDB ObjectId'
      });
    }

    // Validate required fields
    const requiredFields = { name, method, endpoint, controllerCode, controllerName };
    const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Validation failed: Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const methodUpper = method.toUpperCase();
    
    if (!validMethods.includes(methodUpper)) {
      console.log('❌ Validation failed: Invalid HTTP method:', method);
      return res.status(400).json({
        success: false,
        message: `Invalid HTTP method. Must be one of: ${validMethods.join(', ')}`
      });
    }

    // Validate endpoint format
    const trimmedEndpoint = endpoint.trim();
    if (!trimmedEndpoint.startsWith('/')) {
      console.log('❌ Validation failed: Endpoint must start with /', trimmedEndpoint);
      return res.status(400).json({
        success: false,
        message: 'Endpoint must start with forward slash (/)'
      });
    }

    // Validate test cases if provided
    if (testCases && testCases.length > 0) {
      const testCaseValidation = validateTestCases(testCases);
      if (!testCaseValidation.valid) {
        console.log('❌ Test case validation failed:', testCaseValidation.error);
        return res.status(400).json({
          success: false,
          message: `Test case validation error: ${testCaseValidation.error}`
        });
      }
    }

    // Validate documentation parameters if provided
    if (documentation.parameters && documentation.parameters.length > 0) {
      const docValidation = validateDocumentationParams(documentation.parameters);
      if (!docValidation.valid) {
        console.log('❌ Documentation validation failed:', docValidation.error);
        return res.status(400).json({
          success: false,
          message: `Documentation validation error: ${docValidation.error}`
        });
      }
    }

    // Find the folder
    console.log('🔍 Finding folder with ID:', folderId, 'for user:', req.userId);

    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.userId
    });

    console.log('📁 Folder found:', folder ? 'Yes' : 'No');

    if (!folder) {
      console.log('❌ Folder not found or access denied');
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    // Check for duplicate endpoint in the same folder
    const existingApi = folder.apis.find(
      api => api.method === methodUpper && api.endpoint === trimmedEndpoint
    );

    if (existingApi) {
      console.log('❌ Duplicate endpoint found:', methodUpper, trimmedEndpoint);
      return res.status(400).json({
        success: false,
        message: `API endpoint ${methodUpper} ${trimmedEndpoint} already exists in this folder`
      });
    }

    // Process imports - merge with existing folder imports (NEW FORMAT)
    const processedImports = [];
    const existingImports = folder.imports || [];
    
    // Add new imports, avoiding duplicates
    if (Array.isArray(imports)) {
      imports.forEach(newImport => {
        // Validate import structure
        if (!newImport.module || typeof newImport.module !== 'string') {
          console.log('⚠️ Skipping invalid import - missing module:', newImport);
          return;
        }

        // Check if import already exists (by module and type)
        const exists = existingImports.find(
          existing => existing.module === newImport.module && existing.type === newImport.type
        );
        
        if (!exists) {
          processedImports.push({
            module: newImport.module,
            type: newImport.type || 'npm',
            version: newImport.version || 'latest',
            importStatement: newImport.importStatement || '' // NEW FIELD
          });
        }
      });
    }

    // Process test cases with proper structure
    const processedTestCases = testCases.map(testCase => ({
      name: testCase.name.trim(),
      input: {
        params: testCase.input?.params || {},
        query: testCase.input?.query || {},
        body: testCase.input?.body || {}
      },
      expectedOutput: {
        response: testCase.expectedOutput.response
      },
      description: testCase.description || ''
    }));

    // Process documentation with proper structure
    const processedDocumentation = {
      summary: documentation.summary || '',
      parameters: (documentation.parameters || []).map(param => ({
        name: param.name.trim(),
        type: param.type.trim(),
        required: Boolean(param.required),
        description: param.description || '',
        location: param.location || 'body'
      }))
    };

    // Clean and validate controllerCode format
    let cleanedControllerCode = controllerCode.trim();
    
    // If controllerCode starts with exports.functionName, extract just the function
    const exportsMatch = cleanedControllerCode.match(/^exports\.(\w+)\s*=\s*(.+)$/s);
    if (exportsMatch) {
      const [, exportedName, functionCode] = exportsMatch;
      // Use the exported name as controllerName if it matches
      if (exportedName === controllerName.trim()) {
        cleanedControllerCode = `const ${controllerName.trim()} = ${functionCode}`;
      }
    }

    // Create new API object with proper structure
    const newApi = {
      name: name.trim(),
      description: description || '',
      method: methodUpper,
      endpoint: trimmedEndpoint,
      controllerCode: cleanedControllerCode,
      controllerName: controllerName.trim(),
      testCases: processedTestCases,
      documentation: processedDocumentation
    };

    console.log('✅ New API object created:', {
      name: newApi.name,
      method: newApi.method,
      endpoint: newApi.endpoint,
      controllerName: newApi.controllerName,
      testCasesCount: newApi.testCases.length,
      parametersCount: newApi.documentation.parameters.length
    });

    // Store API data for response (before any modifications)
    const responseApiData = {
      name: newApi.name,
      description: newApi.description,
      method: newApi.method,
      endpoint: newApi.endpoint,
      controllerCode: newApi.controllerCode,
      controllerName: newApi.controllerName,
      testCases: newApi.testCases,
      documentation: newApi.documentation
    };

    // Add the new API to the folder
    folder.apis.push(newApi);
    
    // Add new imports to folder (with new format including importStatement)
    if (processedImports.length > 0) {
      folder.imports.push(...processedImports);
      console.log('📦 Added', processedImports.length, 'new imports');
    }
    
    console.log('📊 API added to folder, total APIs:', folder.apis.length);

    // Validate all APIs in the folder before saving (ensure backward compatibility)
    folder.apis.forEach((api, index) => {
      // Ensure all required fields are present
      if (!api.name) api.name = `API ${index + 1}`;
      if (!api.method) api.method = 'GET';
      if (!api.endpoint) api.endpoint = `/api/${index + 1}`;
      if (!api.controllerCode) api.controllerCode = `const defaultController${index + 1} = (req, res) => { res.json({ message: 'Default response' }); }`;
      if (!api.controllerName) {
        // Generate a default controllerName from the API name or method+endpoint
        const defaultName = api.name 
          ? api.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
          : `${api.method.toLowerCase()}${api.endpoint.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        api.controllerName = defaultName || `defaultController${index + 1}`;
        console.log(`🔧 Fixed missing controllerName for API ${index}: ${api.controllerName}`);
      }
      
      // Ensure testCases is an array
      if (!Array.isArray(api.testCases)) {
        api.testCases = [];
      }
      
      // Ensure documentation exists
      if (!api.documentation) {
        api.documentation = {
          summary: '',
          parameters: []
        };
      }
      
      // Ensure parameters is an array
      if (!Array.isArray(api.documentation.parameters)) {
        api.documentation.parameters = [];
      }
    });

    // Save the folder (NO MORE GENERATED FILES STORED)
    console.log('💾 Saving folder...');
    const savedFolder = await folder.save();
    console.log('✅ Folder saved successfully');

    // Get the last API from saved folder for the _id
    const lastSavedApi = savedFolder.apis[savedFolder.apis.length - 1];

    // Send success response
    res.status(201).json({
      success: true,
      message: 'API created successfully',
      data: {
        _id: lastSavedApi._id, // Use the MongoDB generated _id
        name: responseApiData.name,
        description: responseApiData.description,
        method: responseApiData.method,
        endpoint: responseApiData.endpoint,
        controllerCode: responseApiData.controllerCode,
        controllerName: responseApiData.controllerName,
        testCases: responseApiData.testCases,
        documentation: responseApiData.documentation
      },
      totalApis: savedFolder.apis.length,
      totalImports: savedFolder.imports.length
    });

  } catch (error) {
    console.error('❌ Error creating API:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('❌ MongoDB Validation Error:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Database validation error',
        errors: validationErrors
      });
    }

    if (error.name === 'CastError') {
      console.log('❌ MongoDB Cast Error:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid data format provided'
      });
    }

    if (error.code === 11000) {
      console.log('❌ MongoDB Duplicate Key Error:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while creating API',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};
const getApiById = async (req, res) => {
  try {
    const { folderId, apiId } = req.params;

    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.userId
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    const api = folder.apis.id(apiId);

    if (!api) {
      return res.status(404).json({
        success: false,
        message: 'API not found'
      });
    }

    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API',
      error: error.message
    });
  }
};

// Update API in folder
// const updateApi = async (req, res) => {
//   try {
//     const { folderId, apiId } = req.params;
//     const updateData = req.body;
//     console.log("Into the update api")
//     const folder = await Folder.findOne({
//       _id: folderId,
//       userId: req.userId
//     });

//     if (!folder) {
//       return res.status(404).json({
//         success: false,
//         message: 'Folder not found or access denied'
//       });
//     }

//     const api = folder.apis.id(apiId);

//     if (!api) {
//       return res.status(404).json({
//         success: false,
//         message: 'API not found'
//       });
//     }

//     // Check for duplicate endpoint if method or endpoint is being changed
//     if (updateData.method || updateData.endpoint) {
//       const newMethod = updateData.method ? updateData.method.toUpperCase() : api.method;
//       const newEndpoint = updateData.endpoint || api.endpoint;

//       const existingApi = folder.apis.find(
//         a => a._id.toString() !== apiId && 
//              a.method === newMethod && 
//              a.endpoint === newEndpoint
//       );

//       if (existingApi) {
//         return res.status(400).json({
//           success: false,
//           message: 'API endpoint already exists in this folder'
//         });
//       }
//     }

//     // Update API fields
//     Object.assign(api, updateData);
//     if (updateData.method) {
//       api.method = updateData.method.toUpperCase();
//     }
//     api.lastRegenerated = new Date();

//     await folder.save();

//     res.json({
//       success: true,
//       message: 'API updated successfully',
//       data: api
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating API',
//       error: error.message
//     });
//   }
// };
const updateApi = async (req, res) => {
  try {
    const { folderId, apiId } = req.params;
    const updateData = req.body;
    console.log("Into the update api");

    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.userId
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    const api = folder.apis.id(apiId);

    if (!api) {
      return res.status(404).json({
        success: false,
        message: 'API not found'
      });
    }

    // Check for duplicate name if name is being changed
    if (updateData.name && updateData.name.trim() !== api.name) {
      const existingApi = folder.apis.find(
        a => a._id.toString() !== apiId && 
             a.name.toLowerCase().trim() === updateData.name.toLowerCase().trim()
      );

      if (existingApi) {
        return res.status(409).json({
          success: false,
          message: 'An API with this name already exists in this folder'
        });
      }
    }

    // Check for duplicate endpoint if method or endpoint is being changed
    if (updateData.method || updateData.endpoint) {
      const newMethod = updateData.method ? updateData.method.toUpperCase() : api.method;
      const newEndpoint = updateData.endpoint || api.endpoint;

      const existingApi = folder.apis.find(
        a => a._id.toString() !== apiId && 
             a.method === newMethod && 
             a.endpoint === newEndpoint
      );

      if (existingApi) {
        return res.status(409).json({
          success: false,
          message: 'API endpoint already exists in this folder'
        });
      }
    }

    // Update allowed fields based on schema
    const allowedFields = [
      'name',
      'description',
      'method',
      'endpoint',
      'controllerCode',
      'controllerName',
      'testCases',
      'documentation'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'method' && updateData[field]) {
          api[field] = updateData[field].toUpperCase();
        } else if (field === 'name' && updateData[field]) {
          api[field] = updateData[field].trim();
        } else if (field === 'testCases' && Array.isArray(updateData[field])) {
          // Validate testCases structure
          api[field] = updateData[field].map(tc => ({
            name: tc.name,
            input: {
              params: tc.input?.params || {},
              query: tc.input?.query || {},
              body: tc.input?.body || {}
            },
            expectedOutput: {
              response: tc.expectedOutput?.response || {}
            },
            description: tc.description || ''
          }));
        } else if (field === 'documentation' && updateData[field]) {
          // Validate documentation structure
          api.documentation = {
            summary: updateData[field].summary || '',
            parameters: Array.isArray(updateData[field].parameters)
              ? updateData[field].parameters.map(param => ({
                  name: param.name,
                  type: param.type,
                  required: param.required || false,
                  description: param.description || '',
                  location: param.location || 'body'
                }))
              : []
          };
        } else {
          api[field] = updateData[field];
        }
      }
    });

    await folder.save();

    res.json({
      success: true,
      message: 'API updated successfully',
      data: api
    });
  } catch (error) {
    console.error('Error updating API:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating API',
      error: error.message
    });
  }
};
// Delete API from folder
const deleteApi = async (req, res) => {
  try {
    const { folderId, apiId } = req.params;

    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.userId
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or access denied'
      });
    }

    const api = folder.apis.id(apiId);

    if (!api) {
      return res.status(404).json({
        success: false,
        message: 'API not found'
      });
    }

    folder.apis.pull(apiId);
    await folder.save();

    res.json({
      success: true,
      message: 'API deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting API',
      error: error.message
    });
  }
};

module.exports = {
  createFolder,
  getFoldersByProject,
  getFolderById,
  updateFolder,
  deleteFolder,
  createApi,
  getApiById,
  updateApi,
  deleteApi
};