const Folder = require('../models/Folder');
const Project = require('../models/Project');

// FOLDER CRUD OPERATIONS

// Create new folder
const createFolder = async (req, res) => {
  try {
    const { name, description, projectId } = req.body;
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
      apis: []
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
      testCases,
      documentation
    } = req.body;

    // Validate required fields
    if (!name || !method || !endpoint || !controllerCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, method, endpoint, or controllerCode'
      });
    }

    // Validate folderId format
    if (!folderId || !folderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID format'
      });
    }

    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

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

    // Check for duplicate endpoint in the same folder
    const methodUpper = method.toUpperCase();
    const existingApi = folder.apis.find(
      api => api.method === methodUpper && api.endpoint === endpoint
    );

    if (existingApi) {
      return res.status(400).json({
        success: false,
        message: `API endpoint ${methodUpper} ${endpoint} already exists in this folder`
      });
    }

    // Create new API object with proper structure
    const newApi = {
      name: name.trim(),
      description: description || '',
      method: methodUpper,
      endpoint: endpoint.trim(),
      controllerCode,
      testCases: Array.isArray(testCases) ? testCases : [],
      documentation: {
        summary: documentation?.summary || '',
        parameters: Array.isArray(documentation?.parameters) ? documentation.parameters : []
      }
    };

    console.log('New API object:', JSON.stringify(newApi, null, 2));

    // Add the new API to the folder
    folder.apis.push(newApi);
    
    // Get the created API (the last one added)
    const createdApi = folder.apis[folder.apis.length - 1];
    
    console.log('API added to folder, total APIs:', folder.apis.length);
    
    // Save the folder
    const savedFolder = await folder.save();
    console.log('Folder saved successfully');

    res.status(201).json({
      success: true,
      message: 'API created successfully',
      data: {
        _id: createdApi._id,
        name: createdApi.name,
        description: createdApi.description,
        method: createdApi.method,
        endpoint: createdApi.endpoint,
        controllerCode: createdApi.controllerCode,
        testCases: createdApi.testCases,
        documentation: createdApi.documentation
      }
    });

  } catch (error) {
    console.error('Error creating API:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating API',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get specific API from folder
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
const updateApi = async (req, res) => {
  try {
    const { folderId, apiId } = req.params;
    const updateData = req.body;

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
        return res.status(400).json({
          success: false,
          message: 'API endpoint already exists in this folder'
        });
      }
    }

    // Update API fields
    Object.assign(api, updateData);
    if (updateData.method) {
      api.method = updateData.method.toUpperCase();
    }
    api.lastRegenerated = new Date();

    await folder.save();

    res.json({
      success: true,
      message: 'API updated successfully',
      data: api
    });
  } catch (error) {
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