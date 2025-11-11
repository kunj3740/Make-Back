// const fs = require('fs');
// const path = require('path');
// const Diagram = require('../models/Diagram');
// const Folder = require('../models/Folder');
// const Project = require('../models/Project');

// const generateProjectStructure = async (req, res) => {
//   try {
//     const { projectId, diagramId } = req.body;

//     if (!projectId || !diagramId) {
//       return res.status(400).json({
//         success: false,
//         message: 'projectId and diagramId are required'
//       });
//     }

//     // Fetch project details
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }

//     // Fetch diagram with generated models
//     const diagram = await Diagram.findById(diagramId);
//     if (!diagram) {
//       return res.status(404).json({
//         success: false,
//         message: 'Diagram not found'
//       });
//     }

//     // Fetch all folders (which contain routes and controllers) for this project
//     const folders = await Folder.find({ projectId });

//     // Create temp directory structure
//     const tempDir = path.join(process.cwd(), 'temp', `project_${projectId}_${Date.now()}`);
//     const modelsDir = path.join(tempDir, 'models');
//     const routesDir = path.join(tempDir, 'routes');
//     const controllersDir = path.join(tempDir, 'controllers');

//     // Create directories
//     fs.mkdirSync(tempDir, { recursive: true });
//     fs.mkdirSync(modelsDir, { recursive: true });
//     fs.mkdirSync(routesDir, { recursive: true });
//     fs.mkdirSync(controllersDir, { recursive: true });

//     // Collect all imports from folders
//     const allImports = new Set();
//     folders.forEach(folder => {
//       if (folder.imports && folder.imports.length > 0) {
//         folder.imports.forEach(imp => {
//           if (imp.type === 'npm') {
//             allImports.add(imp.module);
//           }
//         });
//       }
//     });

//     // Generate model files from diagram
//     const modelNames = [];
//     if (diagram.generatedModels && diagram.generatedModels.length > 0) {
//       diagram.generatedModels.forEach(model => {
//         const modelFileName = `${model.entityName}.js`;
//         const modelFilePath = path.join(modelsDir, modelFileName);
//         fs.writeFileSync(modelFilePath, model.code);
//         modelNames.push(model.entityName);
//       });
//     }

//     // Generate controller and route files from folders
//     const routeImports = [];
//     folders.forEach(folder => {
//       // Generate controller file with imports
//       if (folder.generatedFiles.controllerFile.code) {
//         const controllerFileName = `${folder.name}Controller.js`;
//         const controllerFilePath = path.join(controllersDir, controllerFileName);
        
//         // Generate controller content with proper imports
//         const controllerContent = generateControllerContent(folder);
//         fs.writeFileSync(controllerFilePath, controllerContent);
//       }

//       // Generate route file with proper imports and exports
//       if (folder.generatedFiles.routeFile.code) {
//         const routeFileName = `${folder.name}Routes.js`;
//         const routeFilePath = path.join(routesDir, routeFileName);
        
//         // Generate route content with proper imports and exports
//         const routeContent = generateRouteContent(folder, routeFileName);
//         fs.writeFileSync(routeFilePath, routeContent);
        
//         // Add to route imports for app.js
//         routeImports.push({
//           name: folder.name,
//           fileName: routeFileName,
//           routeName: `${folder.name}Routes`
//         });
//       }
//     });

//     // Generate app.js file
//     const appJsContent = generateAppJsContent(routeImports);
//     const appJsPath = path.join(tempDir, 'app.js');
//     fs.writeFileSync(appJsPath, appJsContent);

//     // Generate package.json with all imports
//     const packageJsonContent = generatePackageJson(project.name, allImports);
//     const packageJsonPath = path.join(tempDir, 'package.json');
//     fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

//     // Generate .gitignore
//     const gitignoreContent = generateGitignore();
//     const gitignorePath = path.join(tempDir, '.gitignore');
//     fs.writeFileSync(gitignorePath, gitignoreContent);

//     // Generate .env template
//     const envContent = generateEnvTemplate();
//     const envPath = path.join(tempDir, '.env.example');
//     fs.writeFileSync(envPath, envContent);

//     return res.status(200).json({
//       success: true,
//       message: 'Project structure generated successfully',
//       data: {
//         tempDir,
//         generatedFiles: {
//           models: modelNames,
//           routes: routeImports.map(r => r.fileName),
//           controllers: folders.map(f => `${f.name}Controller.js`),
//           appJs: 'app.js',
//           packageJson: 'package.json',
//           gitignore: '.gitignore',
//           envExample: '.env.example'
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Error generating project structure:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// const generateControllerContent = (folder) => {
//   let controllerContent = '';
  

//   // Add imports at the top
//   if (folder.imports && folder.imports.length > 0) {
//     folder.imports.forEach(imp => {
//       if (imp.type === 'npm') {
//         controllerContent += `const ${imp.module} = require('${imp.module}');\n`;
//       } else if (imp.type === 'local') {
//         // For local imports (models), extract just the model name
//         const modelName = imp.module.split('/').pop();
//         controllerContent += `const ${modelName} = require('${imp.module}');\n`;
//       } else if (imp.type === 'core') {
//         controllerContent += `const ${imp.module} = require('${imp.module}');\n`;
//       }
//     });
//     controllerContent += '\n';
//   }
  
//   // Add the existing controller code
//   controllerContent += folder.generatedFiles.controllerFile.code;
  
//   return controllerContent;
// };

// const generateRouteContent = (folder, routeFileName) => {
//   let routeContent = '';
  
//   // Add required imports at the top
//   routeContent += `const express = require('express');\n`;
  
//   // Extract controller function names from the route code
//   const routeCode = folder.generatedFiles.routeFile.code;
//   const controllerFunctions = extractControllerFunctions(routeCode);
  
//   if (controllerFunctions.length > 0) {
//     const controllerName = `${folder.name}Controller`;
//     routeContent += `const { ${controllerFunctions.join(', ')} } = require('../controllers/${controllerName}');\n`;
//   }
  
//   routeContent += `const router = express.Router();\n\n`;
  
//   // Add the existing route code
//   routeContent += routeCode;
  
//   // Add module export at the end
//   routeContent += '\n\nmodule.exports = router;';
  
//   return routeContent;
// };

// const extractControllerFunctions = (routeCode) => {
//   const functions = [];
//   const regex = /router\.\w+\([^,]+,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\)/g;
//   let match;
  
//   while ((match = regex.exec(routeCode)) !== null) {
//     if (!functions.includes(match[1])) {
//       functions.push(match[1]);
//     }
//   }
  
//   return functions;
// };

// const generateAppJsContent = (routeImports) => {
//   let appJsContent = `const express = require('express')
// const mongoose = require('mongoose')
// const dotenv = require('dotenv')
// const cors = require('cors')

// `;

//   // Add route imports
//   if (routeImports.length > 0) {
//     appJsContent += `// Route imports\n`;
//     routeImports.forEach(route => {
//       appJsContent += `const ${route.routeName} = require("./routes/${route.fileName.replace('.js', '')}");\n`;
//     });
//     appJsContent += '\n';
//   }

//   appJsContent += `dotenv.config()

// const app = express()
// const PORT = process.env.PORT || 8000

// app.use(cors())
// app.use(express.json())

// `;

//   // Add route usage
//   if (routeImports.length > 0) {
//     appJsContent += `// API Routes\n`;
//     routeImports.forEach(route => {
//       const slicedRouteName = route.name.toLowerCase();
//       appJsContent += `app.use(\`/api/v1/${slicedRouteName}\`, ${route.routeName});\n`;
//     });
//     appJsContent += '\n';
//   }

//   appJsContent += `// Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     success: true, 
//     message: 'Server is running successfully',
//     timestamp: new Date().toISOString()
//   });
// });

// // MongoDB connection
// mongoose.connect(process.env.DATABASE_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => {
//   console.log('Connected to MongoDB')
//   app.listen(PORT, () => console.log(\`Server running on Port \${PORT}\`))
// })
// .catch((err) => {
//   console.error('MongoDB connection error:', err.message)
// })

// module.exports = app;`;

//   return appJsContent;
// };

// const generatePackageJson = (projectName, additionalImports) => {
//   const baseDependencies = {
//     "express": "^4.18.2",
//     "mongoose": "^7.5.0",
//     "dotenv": "^16.3.1",
//     "cors": "^2.8.5",
//     "bcrypt": "^5.1.0",
//     "jsonwebtoken": "^9.0.2",
//     "express-validator": "^7.0.1",
//     "helmet": "^7.0.0",
//     "express-rate-limit": "^6.10.0"
//   };

//   // Add additional imports from folders
//   additionalImports.forEach(imp => {
//     if (!baseDependencies[imp]) {
//       baseDependencies[imp] = "latest";
//     }
//   });

//   return {
//     "name": projectName.toLowerCase().replace(/\s+/g, '-'),
//     "version": "1.0.0",
//     "description": `Generated Node.js backend for ${projectName}`,
//     "main": "app.js",
//     "scripts": {
//       "start": "node app.js",
//       "dev": "nodemon app.js",
//       "test": "echo \"Error: no test specified\" && exit 1"
//     },
//     "dependencies": baseDependencies,
//     "devDependencies": {
//       "nodemon": "^3.0.1"
//     },
//     "keywords": [
//       "nodejs",
//       "express",
//       "mongodb",
//       "api",
//       "backend"
//     ],
//     "author": "Generated by No-Code Platform",
//     "license": "MIT"
//   };
// };

// const generateGitignore = () => {
//   return `# Dependencies
// node_modules/
// npm-debug.log*
// yarn-debug.log*
// yarn-error.log*

// # Environment variables
// .env
// .env.local
// .env.development.local
// .env.test.local
// .env.production.local

// # Logs
// logs
// *.log

// # Runtime data
// pids
// *.pid
// *.seed
// *.pid.lock

// # Coverage directory used by tools like istanbul
// coverage/

// # Dependency directories
// node_modules/
// jspm_packages/

// # Optional npm cache directory
// .npm

// # Optional REPL history
// .node_repl_history

// # Output of 'npm pack'
// *.tgz

// # Yarn Integrity file
// .yarn-integrity

// # dotenv environment variables file
// .env

// # IDE files
// .vscode/
// .idea/
// *.swp
// *.swo
// *~

// # OS generated files
// .DS_Store
// .DS_Store?
// ._*
// .Spotlight-V100
// .Trashes
// ehthumbs.db
// Thumbs.db

// # Temporary folders
// temp/
// tmp/
// `;
// };

// const generateEnvTemplate = () => {
//   return `# Database Configuration
// DATABASE_URL=mongodb://localhost:27017/your_database_name

// # Server Configuration
// PORT=8000

// # Add other environment variables as needed
// # JWT_SECRET=your_jwt_secret_here
// # API_KEY=your_api_key_here
// `;
// };

// module.exports = {
//   generateProjectStructure
// };
const fs = require('fs');
const path = require('path');
const Diagram = require('../models/Diagram');
const Folder = require('../models/Folder');
const Project = require('../models/Project');


const { Octokit } = require('@octokit/rest');
const User = require('../models/User');


const archiver = require('archiver');

const axios = require('axios');


/**
 * Deploy GitHub repository to Render using Blueprint
 * @route POST /api/v1/deploy/render/:projectId
 */
const deployToRender = async (req, res) => {
  try {
    console.log('=== DEPLOY TO RENDER ===');
    console.log('User ID:', req.userId);
    console.log('Project ID:', req.params.projectId);

    const { projectId } = req.params;

    // Validate authentication
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate projectId
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Fetch project with GitHub repo link
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

    // Check if GitHub repo link exists
    if (!project.githubRepoLink) {
      return res.status(400).json({
        success: false,
        message: 'GitHub repository link not found. Please push your code to GitHub first.'
      });
    }

    console.log('GitHub Repo Link:', project.githubRepoLink);

    // Validate Render API key
    const renderApiKey = process.env.RENDER_API_KEY;
    if (!renderApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Render API key not configured on server'
      });
    }

    // Extract repo details from GitHub URL
    const repoMatch = project.githubRepoLink.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL format'
      });
    }

    const [, repoOwner, repoName] = repoMatch;
    const cleanRepoName = repoName.replace('.git', '');

    // Generate unique service name
    const timestamp = Date.now();
    const serviceName = `${cleanRepoName}-${timestamp}`.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .substring(0, 60);

    console.log('Service Name:', serviceName);

    // First, get the owner ID from Render API
    console.log('Fetching Render account owner ID...');
    let ownerId;
    
    try {
      const ownerResponse = await axios.get(
        'https://api.render.com/v1/owners',
        {
          headers: {
            'Authorization': `Bearer ${renderApiKey}`,
            'Accept': 'application/json'
          },
          timeout: 15000
        }
      );

      // Get the first owner (usually your personal account)
      const owners = ownerResponse.data;
      if (owners && owners.length > 0) {
        ownerId = owners[0].owner.id;
        console.log('Owner ID found:', ownerId);
      } else {
        return res.status(400).json({
          success: false,
          message: 'No Render account owner found. Please verify your Render API key.'
        });
      }
    } catch (ownerError) {
      console.error('Error fetching owner ID:', ownerError.response?.data);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch Render account information',
        error: ownerError.response?.data?.message || ownerError.message
      });
    }

    // Simplified Render API payload based on their docs
    const deploymentPayload = {
      type: 'web_service',
      name: serviceName,
      ownerId: ownerId, // REQUIRED FIELD
      repo: project.githubRepoLink,
      autoDeploy: 'yes',
      branch: 'main',
      rootDir: './',
      serviceDetails: {
        env: 'node',
        region: 'oregon',
        plan: 'free',
        buildCommand: 'npm install',
        startCommand: 'npm start',
        healthCheckPath: '/',
        envVars: [
          {
            key: 'NODE_ENV',
            value: 'production'
          }
        ]
      }
    };

    console.log('Deploying to Render...');

    // Make request to Render API
    const renderResponse = await axios.post(
      'https://api.render.com/v1/services',
      deploymentPayload,
      {
        headers: {
          'Authorization': `Bearer ${renderApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    const service = renderResponse.data.service || renderResponse.data;
    
    console.log('✅ Service created on Render');
    console.log('Response:', JSON.stringify(renderResponse.data, null, 2));

    // Construct service URL
    const serviceUrl = service.serviceDetails?.url || 
                      service.url || 
                      `https://${serviceName}.onrender.com`;

    // Update project with deployment info
    project.renderServiceId = service.id;
    project.deploymentUrl = serviceUrl;
    await project.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Successfully deployed to Render',
      data: {
        serviceId: service.id,
        serviceName: service.name,
        deploymentUrl: serviceUrl,
        status: service.serviceDetails?.deployStatus || 'deploying',
        region: service.serviceDetails?.region || 'oregon',
        createdAt: service.createdAt,
        githubRepo: project.githubRepoLink,
        autoDeploy: true,
        dashboard: `https://dashboard.render.com/web/${service.id}`,
        logs: `https://dashboard.render.com/web/${service.id}/logs`,
        settings: `https://dashboard.render.com/web/${service.id}/settings`
      }
    });

  } catch (error) {
    console.error('❌ Error deploying to Render:', error);
    console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error status:', error.response?.status);

    // Handle specific Render API errors
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Render API key. Please check your configuration.'
      });
    }

    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Invalid deployment configuration';
      
      return res.status(400).json({
        success: false,
        message: errorMsg,
        details: error.response?.data
      });
    }

    if (error.response?.status === 402) {
      return res.status(402).json({
        success: false,
        message: 'Payment required. You may have reached your Render free tier limit.'
      });
    }

    if (error.response?.status === 409) {
      return res.status(409).json({
        success: false,
        message: 'Service with this name already exists on Render'
      });
    }

    if (error.response?.status === 422) {
      return res.status(422).json({
        success: false,
        message: 'Repository validation failed. Make sure your repository is public and contains a valid Node.js project with package.json',
        details: error.response?.data
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to deploy to Render',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
    });
  }
};

/**
 * Alternative: Deploy using Render Blueprint (YAML-based)
 * This is more reliable and follows Render's recommended approach
 */
const deployToRenderWithBlueprint = async (req, res) => {
  try {
    console.log('=== DEPLOY TO RENDER WITH BLUEPRINT ===');
    
    const { projectId } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId
    });

    if (!project || !project.githubRepoLink) {
      return res.status(400).json({
        success: false,
        message: 'Project or GitHub repository not found'
      });
    }

    const renderApiKey = process.env.RENDER_API_KEY;
    if (!renderApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Render API key not configured'
      });
    }

    // Extract repo info
    const repoMatch = project.githubRepoLink.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL'
      });
    }

    const [, repoOwner, repoName] = repoMatch;
    const cleanRepoName = repoName.replace('.git', '');
    const timestamp = Date.now();

    // Create Blueprint YAML content
    const blueprintYaml = `services:
  - type: web
    name: ${cleanRepoName}-${timestamp}
    env: node
    region: oregon
    plan: free
    branch: main
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000`;

    console.log('Blueprint YAML:', blueprintYaml);

    // Deploy using Blueprint
    const response = await axios.post(
      'https://api.render.com/v1/blueprints',
      {
        repo: project.githubRepoLink,
        branch: 'main',
        yaml: blueprintYaml
      },
      {
        headers: {
          'Authorization': `Bearer ${renderApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const blueprint = response.data;
    console.log('✅ Blueprint deployed');

    // Extract service info from blueprint
    const service = blueprint.services?.[0] || {};
    const serviceUrl = service.serviceDetails?.url || `https://${cleanRepoName}-${timestamp}.onrender.com`;

    // Update project
    project.renderServiceId = service.id || blueprint.id;
    project.deploymentUrl = serviceUrl;
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Successfully deployed to Render using Blueprint',
      data: {
        blueprintId: blueprint.id,
        serviceId: service.id,
        serviceName: service.name,
        deploymentUrl: serviceUrl,
        status: 'deploying',
        githubRepo: project.githubRepoLink
      }
    });

  } catch (error) {
    console.error('❌ Blueprint deployment error:', error);
    console.error('Error response:', error.response?.data);

    res.status(500).json({
      success: false,
      message: 'Failed to deploy with Blueprint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      details: error.response?.data
    });
  }
};

/**
 * Get deployment status
 */
const getDeploymentStatus = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.renderServiceId) {
      return res.status(404).json({
        success: false,
        message: 'No deployment found for this project'
      });
    }

    const renderApiKey = process.env.RENDER_API_KEY;
    if (!renderApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Render API key not configured'
      });
    }

    const response = await axios.get(
      `https://api.render.com/v1/services/${project.renderServiceId}`,
      {
        headers: {
          'Authorization': `Bearer ${renderApiKey}`
        },
        timeout: 15000
      }
    );

    const service = response.data.service || response.data;

    res.status(200).json({
      success: true,
      data: {
        serviceId: service.id,
        serviceName: service.name,
        status: service.serviceDetails?.deployStatus || 'unknown',
        deploymentUrl: service.serviceDetails?.url || project.deploymentUrl,
        lastDeployedAt: service.updatedAt,
        region: service.serviceDetails?.region,
        dashboard: `https://dashboard.render.com/web/${project.renderServiceId}`
      }
    });

  } catch (error) {
    console.error('Error getting status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment status',
      error: error.message
    });
  }
};

/**
 * Delete deployment
 */
const deleteDeployment = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId
    });

    if (!project || !project.renderServiceId) {
      return res.status(404).json({
        success: false,
        message: 'No deployment found'
      });
    }

    const renderApiKey = process.env.RENDER_API_KEY;
    if (!renderApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Render API key not configured'
      });
    }

    await axios.delete(
      `https://api.render.com/v1/services/${project.renderServiceId}`,
      {
        headers: {
          'Authorization': `Bearer ${renderApiKey}`
        },
        timeout: 15000
      }
    );

    // Clean up project
    project.renderServiceId = undefined;
    project.deploymentUrl = undefined;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Deployment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting deployment:', error);

    if (error.response?.status === 404) {
      const project = await Project.findOne({
        _id: req.params.projectId,
        owner: req.userId
      });
      
      if (project) {
        project.renderServiceId = undefined;
        project.deploymentUrl = undefined;
        await project.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Deployment already deleted'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete deployment',
      error: error.message
    });
  }
};



// const axios = require('axios');

// const deployToRender = async (req, res) => {
//   try {
//     console.log('=== DEPLOY TO RENDER ===');
//     console.log('User ID:', req.userId);
//     console.log('Project ID:', req.params.projectId);

//     const { projectId } = req.params;

//     // Validate authentication
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not authenticated'
//       });
//     }

//     // Validate projectId
//     if (!projectId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project ID is required'
//       });
//     }

//     // Fetch project with GitHub repo link
//     const project = await Project.findOne({
//       _id: projectId,
//       owner: req.userId
//     });

//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found or access denied'
//       });
//     }

//     // Check if GitHub repo link exists
//     if (!project.githubRepoLink) {
//       return res.status(400).json({
//         success: false,
//         message: 'GitHub repository link not found. Please push your code to GitHub first.'
//       });
//     }

//     console.log('GitHub Repo Link:', project.githubRepoLink);

//     // Validate Render API key
//     const renderApiKey = process.env.RENDER_API_KEY;
//     if (!renderApiKey) {
//       return res.status(500).json({
//         success: false,
//         message: 'Render API key not configured on server'
//       });
//     }

//     // Extract repo details from GitHub URL
//     // Format: https://github.com/username/repo-name
//     const repoMatch = project.githubRepoLink.match(/github\.com\/([^\/]+)\/([^\/]+)/);
//     if (!repoMatch) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid GitHub repository URL format'
//       });
//     }

//     const [, repoOwner, repoName] = repoMatch;
//     const cleanRepoName = repoName.replace('.git', '');

//     console.log('Repo Owner:', repoOwner);
//     console.log('Repo Name:', cleanRepoName);

//     // Get user details for service name
//     const user = await User.findById(req.userId).select('name githubUsername');
    
//     // Generate unique service name (Render requires unique names)
//     const timestamp = Date.now();
//     const serviceName = `${cleanRepoName}-${timestamp}`.toLowerCase()
//       .replace(/[^a-z0-9-]/g, '-') // Remove invalid characters
//       .substring(0, 60); // Render has a 60 character limit

//     console.log('Service Name:', serviceName);

//     // Prepare Render API request
//     const renderApiUrl = 'https://api.render.com/v1/services';
    
//     const deploymentPayload = {
//       type: 'web_service',
//       name: serviceName,
//       ownerId: null, // Will use default owner from API key
//       repo: project.githubRepoLink,
//       autoDeploy: 'yes',
//       branch: 'main',
//       serviceDetails: {
//         env: 'node',
//         buildCommand: 'npm install',
//         startCommand: 'npm start',
//         envVars: [
//           {
//             key: 'NODE_ENV',
//             value: 'production'
//           },
//           {
//             key: 'PORT',
//             value: '10000'
//           }
//         ],
//         plan: 'free',
//         region: 'oregon',
//         healthCheckPath: '/',
//         numInstances: 1
//       }
//     };

//     console.log('Deploying to Render...');
//     console.log('Payload:', JSON.stringify(deploymentPayload, null, 2));

//     // Make request to Render API
//     const renderResponse = await axios.post(renderApiUrl, deploymentPayload, {
//       headers: {
//         'Authorization': `Bearer ${renderApiKey}`,
//         'Content-Type': 'application/json'
//       },
//       timeout: 30000 // 30 second timeout
//     });

//     const service = renderResponse.data;
    
//     console.log('✅ Service created on Render');
//     console.log('Service ID:', service.service?.id);
//     console.log('Service URL:', service.service?.serviceDetails?.url);

//     // Update project with deployment info
//     project.renderServiceId = service.service?.id;
//     project.deploymentUrl = service.service?.serviceDetails?.url;
//     await project.save();

//     // Send success response
//     res.status(201).json({
//       success: true,
//       message: 'Successfully deployed to Render',
//       data: {
//         serviceId: service.service?.id,
//         serviceName: service.service?.name,
//         deploymentUrl: service.service?.serviceDetails?.url || `https://${serviceName}.onrender.com`,
//         status: service.service?.serviceDetails?.deployStatus || 'deploying',
//         region: service.service?.serviceDetails?.region,
//         createdAt: service.service?.createdAt,
//         githubRepo: project.githubRepoLink,
//         autoDeploy: true,
//         dashboard: `https://dashboard.render.com/web/${service.service?.id}`,
//         logs: `https://dashboard.render.com/web/${service.service?.id}/logs`,
//         settings: `https://dashboard.render.com/web/${service.service?.id}/settings`
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error deploying to Render:', error);
//     console.error('Error response:', error.response?.data);
//     console.error('Error stack:', error.stack);

//     // Handle specific Render API errors
//     if (error.response?.status === 401) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid Render API key. Please check your configuration.'
//       });
//     }

//     if (error.response?.status === 400) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid deployment configuration',
//         error: error.response?.data?.message || error.message
//       });
//     }

//     if (error.response?.status === 409) {
//       return res.status(409).json({
//         success: false,
//         message: 'Service with this name already exists on Render',
//         error: error.response?.data?.message
//       });
//     }

//     if (error.response?.status === 422) {
//       return res.status(422).json({
//         success: false,
//         message: 'Validation error. Please check your GitHub repository settings.',
//         error: error.response?.data?.message || 'Repository must be public or Render must have access'
//       });
//     }

//     // Generic error response
//     res.status(500).json({
//       success: false,
//       message: 'Failed to deploy to Render',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
//       details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
//     });
//   }
// };

// /**
//  * Get deployment status from Render
//  * @route GET /api/v1/deploy/render/status/:projectId
//  */
// const getDeploymentStatus = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     // Validate authentication
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not authenticated'
//       });
//     }

//     // Fetch project
//     const project = await Project.findOne({
//       _id: projectId,
//       owner: req.userId
//     });

//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found or access denied'
//       });
//     }

//     if (!project.renderServiceId) {
//       return res.status(404).json({
//         success: false,
//         message: 'No deployment found for this project'
//       });
//     }

//     // Validate Render API key
//     const renderApiKey = process.env.RENDER_API_KEY;
//     if (!renderApiKey) {
//       return res.status(500).json({
//         success: false,
//         message: 'Render API key not configured on server'
//       });
//     }

//     // Get service status from Render
//     const renderApiUrl = `https://api.render.com/v1/services/${project.renderServiceId}`;
    
//     const renderResponse = await axios.get(renderApiUrl, {
//       headers: {
//         'Authorization': `Bearer ${renderApiKey}`
//       },
//       timeout: 15000
//     });

//     const service = renderResponse.data;

//     res.status(200).json({
//       success: true,
//       data: {
//         serviceId: service.service?.id,
//         serviceName: service.service?.name,
//         status: service.service?.serviceDetails?.deployStatus,
//         deploymentUrl: service.service?.serviceDetails?.url || project.deploymentUrl,
//         lastDeployedAt: service.service?.updatedAt,
//         region: service.service?.serviceDetails?.region,
//         dashboard: `https://dashboard.render.com/web/${project.renderServiceId}`
//       }
//     });

//   } catch (error) {
//     console.error('Error getting deployment status:', error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get deployment status',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//     });
//   }
// };

// /**
//  * Delete deployment from Render
//  * @route DELETE /api/v1/deploy/render/:projectId
//  */
// const deleteDeployment = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     // Validate authentication
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not authenticated'
//       });
//     }

//     // Fetch project
//     const project = await Project.findOne({
//       _id: projectId,
//       owner: req.userId
//     });

//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found or access denied'
//       });
//     }

//     if (!project.renderServiceId) {
//       return res.status(404).json({
//         success: false,
//         message: 'No deployment found for this project'
//       });
//     }

//     // Validate Render API key
//     const renderApiKey = process.env.RENDER_API_KEY;
//     if (!renderApiKey) {
//       return res.status(500).json({
//         success: false,
//         message: 'Render API key not configured on server'
//       });
//     }

//     // Delete service from Render
//     const renderApiUrl = `https://api.render.com/v1/services/${project.renderServiceId}`;
    
//     await axios.delete(renderApiUrl, {
//       headers: {
//         'Authorization': `Bearer ${renderApiKey}`
//       },
//       timeout: 15000
//     });

//     // Update project - remove deployment info
//     project.renderServiceId = undefined;
//     project.deploymentUrl = undefined;
//     await project.save();

//     res.status(200).json({
//       success: true,
//       message: 'Deployment deleted successfully'
//     });

//   } catch (error) {
//     console.error('Error deleting deployment:', error);
    
//     if (error.response?.status === 404) {
//       // Service already deleted on Render, clean up our DB
//       const project = await Project.findOne({
//         _id: req.params.projectId,
//         owner: req.userId
//       });
      
//       if (project) {
//         project.renderServiceId = undefined;
//         project.deploymentUrl = undefined;
//         await project.save();
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'Deployment already deleted'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete deployment',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//     });
//   }
// };
const createGithubRepo = async (req, res) => {
  let tempDir = null;
  
  try {
    console.log('=== CREATE GITHUB REPO WITH CODE ===');
    console.log('User ID:', req.userId);
    console.log('Project ID:', req.params.projectId);

    const { projectId } = req.params;

    const { Octokit } = await import('@octokit/rest');

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    const user = await User.findById(req.userId).select('githubUsername githubAccessToken name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.githubAccessToken || !user.githubUsername) {
      return res.status(400).json({
        success: false,
        message: 'GitHub account not connected. Please connect your GitHub account first.',
        requiresGithubAuth: true,
      });
    }

    const project = await Project.findOne({ _id: projectId, owner: req.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied' });
    }

    if (!project.name || project.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project name is required to create repository',
      });
    }

    console.log('📦 Generating project structure...');

    const diagram = await Diagram.findOne({ projectId });
    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found for this project. Please create a schema first.',
      });
    }

    const folders = await Folder.find({ projectId });

    const os = require('os');
    tempDir = path.join(os.tmpdir(), 'github-projects', `project_${projectId}_${Date.now()}`);
    const modelsDir = path.join(tempDir, 'models');
    const routesDir = path.join(tempDir, 'routes');
    const controllersDir = path.join(tempDir, 'controllers');

    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(modelsDir, { recursive: true });
    fs.mkdirSync(routesDir, { recursive: true });
    fs.mkdirSync(controllersDir, { recursive: true });

    const allImports = new Set();
    folders.forEach(folder => {
      if (folder.imports && folder.imports.length > 0) {
        folder.imports.forEach(imp => {
          if (imp.type === 'npm') {
            allImports.add(imp.module);
          }
        });
      }
    });

    const modelNames = [];
    if (diagram.generatedModels && diagram.generatedModels.length > 0) {
      diagram.generatedModels.forEach(model => {
        const modelFileName = `${model.entityName}.js`;
        const modelFilePath = path.join(modelsDir, modelFileName);
        fs.writeFileSync(modelFilePath, model.code);
        modelNames.push(model.entityName);
      });
    }

    const routeImports = [];
    const generatedControllers = [];
    const generatedRoutes = [];

    folders.forEach(folder => {
      if (folder.apis && folder.apis.length > 0) {
        const controllerFileName = `${folder.name}Controller.js`;
        const controllerFilePath = path.join(controllersDir, controllerFileName);
        const controllerContent = generateControllerFromAPIs(folder);
        fs.writeFileSync(controllerFilePath, controllerContent);
        generatedControllers.push(controllerFileName);

        const routeFileName = `${folder.name}Routes.js`;
        const routeFilePath = path.join(routesDir, routeFileName);
        const routeContent = generateRouteFromAPIs(folder);
        fs.writeFileSync(routeFilePath, routeContent);
        generatedRoutes.push(routeFileName);

        routeImports.push({
          name: folder.name,
          fileName: routeFileName,
          routeName: `${folder.name}Routes`,
        });
      }
    });

    const appJsContent = generateAppJsContent(routeImports);
    const appJsPath = path.join(tempDir, 'app.js');
    fs.writeFileSync(appJsPath, appJsContent);

    const packageJsonContent = generatePackageJson(project.name, allImports);
    const packageJsonPath = path.join(tempDir, 'package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

    const gitignoreContent = generateGitignore();
    const gitignorePath = path.join(tempDir, '.gitignore');
    fs.writeFileSync(gitignorePath, gitignoreContent);

    const envContent = generateEnvTemplate();
    const envPath = path.join(tempDir, '.env');
    fs.writeFileSync(envPath, envContent);
    const envExamplePath = path.join(tempDir, '.env.example');
    fs.writeFileSync(envExamplePath, envContent);

    const readmeContent = generateReadme(project.name, user.name || user.githubUsername);
    const readmePath = path.join(tempDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);

    console.log('✅ Project structure generated successfully');

    const repoName = project.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_.]/g, '')
      .toLowerCase();

    if (repoName.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project name contains only invalid characters for GitHub repository',
      });
    }

    console.log('Sanitized repo name:', repoName);

    const octokit = new Octokit({ auth: user.githubAccessToken });

    let githubUser;
    try {
      const { data, headers } = await octokit.users.getAuthenticated();
      githubUser = data;
      console.log('GitHub user verified:', githubUser.login);

      const scopes = headers['x-oauth-scopes']?.split(', ') || [];
      console.log('Available OAuth scopes:', scopes);

      const hasRepoScope = scopes.includes('repo') || scopes.includes('public_repo');
      if (!hasRepoScope) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient GitHub permissions. Please reconnect your GitHub account with repository access.',
          requiresGithubAuth: true,
          requiredScopes: ['repo'],
          currentScopes: scopes,
          authorizationUrl: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo user:email`,
        });
      }
    } catch (authError) {
      console.error('GitHub authentication failed:', authError.message);
      return res.status(401).json({
        success: false,
        message: 'GitHub authentication failed. Please reconnect your GitHub account.',
        requiresGithubAuth: true,
        error: authError.message,
      });
    }

    let repoExists = false;
    let existingRepo = null;
    let repoIsEmpty = false;

    try {
      const { data } = await octokit.repos.get({
        owner: user.githubUsername,
        repo: repoName,
      });
      repoExists = true;
      existingRepo = data;

      try {
        await octokit.repos.getBranch({
          owner: user.githubUsername,
          repo: repoName,
          branch: data.default_branch || 'main',
        });
        repoIsEmpty = false;
        console.log('✅ Repository already exists with commits');
      } catch (branchError) {
        if (branchError.status === 404) {
          console.log('⚠️ Repository exists but is empty (no commits)');
          repoIsEmpty = true;
        } else {
          throw branchError;
        }
      }
    } catch (error) {
      if (error.status !== 404) throw error;
      console.log('Repository does not exist, will create new one');
    }

    let repo = existingRepo;

    if (!repoExists) {
      console.log('Creating repository with auto_init...');
      const createRepoResponse = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: project.description || `Generated backend API for ${project.name}`,
        private: false,
        auto_init: true, // Changed to true to create initial commit
        has_issues: true,
        has_projects: true,
        has_wiki: true,
      });
      repo = createRepoResponse.data;
      console.log('✅ Repository created successfully:', repo.html_url);
      
      // Wait for GitHub to initialize the repository
      console.log('⏳ Waiting for GitHub to initialize repository...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      repoIsEmpty = false; // auto_init creates a commit, so it's not empty
    }

    // ===== UPLOAD ALL FILES TO GITHUB (GIT TREE METHOD) =====
    console.log('📤 Uploading files to GitHub using Git tree...');

    const filesToUpload = getAllFiles(tempDir);
    if (filesToUpload.length === 0) throw new Error('No files found to upload');

    console.log(`Found ${filesToUpload.length} files to upload`);
    const defaultBranch = repo.default_branch || 'main';

    let baseCommitSha = null;
    let baseTreeSha = null;

    // Handle empty vs non-empty repositories differently
    if (repoIsEmpty) {
      console.log('🔧 Initializing empty repository with first commit...');
      
      // Create blobs for all files
      console.log('📦 Creating blobs...');
      const blobs = await Promise.all(
        filesToUpload.map(async filePath => {
          const content = fs.readFileSync(filePath, 'utf8');
          const blob = await octokit.git.createBlob({
            owner: user.githubUsername,
            repo: repoName,
            content,
            encoding: 'utf-8',
          });
          const relativePath = path.relative(tempDir, filePath).replace(/\\/g, '/');
          return { path: relativePath, mode: '100644', type: 'blob', sha: blob.data.sha };
        })
      );

      // Create tree without base_tree (for empty repo)
      console.log('🌲 Creating Git tree (no base)...');
      const { data: newTree } = await octokit.git.createTree({
        owner: user.githubUsername,
        repo: repoName,
        tree: blobs,
      });

      // Create initial commit (no parents)
      console.log('📝 Creating initial commit...');
      const { data: newCommit } = await octokit.git.createCommit({
        owner: user.githubUsername,
        repo: repoName,
        message: 'Initial commit: Add generated project files',
        tree: newTree.sha,
        parents: [], // No parents for initial commit
      });

      // Create the branch reference
      console.log('🔄 Creating branch reference...');
      await octokit.git.createRef({
        owner: user.githubUsername,
        repo: repoName,
        ref: `refs/heads/${defaultBranch}`,
        sha: newCommit.sha,
      });

      console.log('✅ Initial commit created successfully!');

    } else {
      console.log('📥 Repository has commits, updating existing branch...');
      
      // Get current commit and tree
      try {
        const { data: refData } = await octokit.git.getRef({
          owner: user.githubUsername,
          repo: repoName,
          ref: `heads/${defaultBranch}`,
        });
        baseCommitSha = refData.object.sha;

        const { data: commitData } = await octokit.git.getCommit({
          owner: user.githubUsername,
          repo: repoName,
          commit_sha: baseCommitSha,
        });
        baseTreeSha = commitData.tree.sha;
        
        console.log('✅ Found base commit and tree');
      } catch (error) {
        console.error('❌ Error getting base commit:', error.message);
        throw new Error('Failed to get base commit from repository');
      }

      // Create blobs for all files
      console.log('📦 Creating blobs...');
      const blobs = await Promise.all(
        filesToUpload.map(async filePath => {
          const content = fs.readFileSync(filePath, 'utf8');
          const blob = await octokit.git.createBlob({
            owner: user.githubUsername,
            repo: repoName,
            content,
            encoding: 'utf-8',
          });
          const relativePath = path.relative(tempDir, filePath).replace(/\\/g, '/');
          return { path: relativePath, mode: '100644', type: 'blob', sha: blob.data.sha };
        })
      );

      // Create tree with base_tree (for non-empty repo)
      console.log('🌲 Creating Git tree (with base)...');
      const { data: newTree } = await octokit.git.createTree({
        owner: user.githubUsername,
        repo: repoName,
        base_tree: baseTreeSha,
        tree: blobs,
      });

      // Create new commit with parent
      console.log('📝 Creating commit...');
      const { data: newCommit } = await octokit.git.createCommit({
        owner: user.githubUsername,
        repo: repoName,
        message: 'Update: Add generated project files',
        tree: newTree.sha,
        parents: [baseCommitSha],
      });

      // Update branch reference
      console.log('🔄 Updating branch reference...');
      await octokit.git.updateRef({
        owner: user.githubUsername,
        repo: repoName,
        ref: `heads/${defaultBranch}`,
        sha: newCommit.sha,
        force: true,
      });

      console.log('✅ Files uploaded successfully!');
    }

    project.githubRepoLink = repo.html_url;
    await project.save();

    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('🧹 Cleaned up temp directory');
    }

    res.status(repoExists ? 200 : 201).json({
      success: true,
      message: repoExists
        ? 'Code pushed to existing GitHub repository successfully'
        : 'GitHub repository created and code pushed successfully',
      data: {
        repoName: repo.name,
        repoFullName: repo.full_name,
        repoUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
        description: repo.description,
        isPrivate: repo.private,
        createdAt: repo.created_at,
        owner: {
          username: repo.owner.login,
          avatarUrl: repo.owner.avatar_url,
          profileUrl: repo.owner.html_url,
        },
        filesUploaded: filesToUpload.length,
        generatedFiles: {
          models: modelNames.length,
          routes: generatedRoutes.length,
          controllers: generatedControllers.length,
        },
        repoAlreadyExisted: repoExists,
      },
    });
  } catch (error) {
    console.error('❌ Error creating GitHub repository:', error);
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create GitHub repository',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
  }
};
// const createGithubRepo = async (req, res) => {
//   let tempDir = null;
  
//   try {
//     console.log('=== CREATE GITHUB REPO WITH CODE ===');
//     console.log('User ID:', req.userId);
//     console.log('Project ID:', req.params.projectId);

//     const { projectId } = req.params;

//     const { Octokit } = await import('@octokit/rest');

//     if (!req.userId) {
//       return res.status(401).json({ success: false, message: 'User not authenticated' });
//     }

//     if (!projectId) {
//       return res.status(400).json({ success: false, message: 'Project ID is required' });
//     }

//     const user = await User.findById(req.userId).select('githubUsername githubAccessToken name');
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (!user.githubAccessToken || !user.githubUsername) {
//       return res.status(400).json({
//         success: false,
//         message: 'GitHub account not connected. Please connect your GitHub account first.',
//         requiresGithubAuth: true,
//       });
//     }

//     const project = await Project.findOne({ _id: projectId, owner: req.userId });
//     if (!project) {
//       return res.status(404).json({ success: false, message: 'Project not found or access denied' });
//     }

//     if (!project.name || project.name.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         message: 'Project name is required to create repository',
//       });
//     }

//     console.log('📦 Generating project structure...');

//     const diagram = await Diagram.findOne({ projectId });
//     if (!diagram) {
//       return res.status(404).json({
//         success: false,
//         message: 'Diagram not found for this project. Please create a schema first.',
//       });
//     }

//     const folders = await Folder.find({ projectId });

//     const os = require('os');
//     tempDir = path.join(os.tmpdir(), 'github-projects', `project_${projectId}_${Date.now()}`);
//     const modelsDir = path.join(tempDir, 'models');
//     const routesDir = path.join(tempDir, 'routes');
//     const controllersDir = path.join(tempDir, 'controllers');

//     fs.mkdirSync(tempDir, { recursive: true });
//     fs.mkdirSync(modelsDir, { recursive: true });
//     fs.mkdirSync(routesDir, { recursive: true });
//     fs.mkdirSync(controllersDir, { recursive: true });

//     const allImports = new Set();
//     folders.forEach(folder => {
//       if (folder.imports && folder.imports.length > 0) {
//         folder.imports.forEach(imp => {
//           if (imp.type === 'npm') {
//             allImports.add(imp.module);
//           }
//         });
//       }
//     });

//     const modelNames = [];
//     if (diagram.generatedModels && diagram.generatedModels.length > 0) {
//       diagram.generatedModels.forEach(model => {
//         const modelFileName = `${model.entityName}.js`;
//         const modelFilePath = path.join(modelsDir, modelFileName);
//         fs.writeFileSync(modelFilePath, model.code);
//         modelNames.push(model.entityName);
//       });
//     }

//     const routeImports = [];
//     const generatedControllers = [];
//     const generatedRoutes = [];

//     folders.forEach(folder => {
//       if (folder.apis && folder.apis.length > 0) {
//         const controllerFileName = `${folder.name}Controller.js`;
//         const controllerFilePath = path.join(controllersDir, controllerFileName);
//         const controllerContent = generateControllerFromAPIs(folder);
//         fs.writeFileSync(controllerFilePath, controllerContent);
//         generatedControllers.push(controllerFileName);

//         const routeFileName = `${folder.name}Routes.js`;
//         const routeFilePath = path.join(routesDir, routeFileName);
//         const routeContent = generateRouteFromAPIs(folder);
//         fs.writeFileSync(routeFilePath, routeContent);
//         generatedRoutes.push(routeFileName);

//         routeImports.push({
//           name: folder.name,
//           fileName: routeFileName,
//           routeName: `${folder.name}Routes`,
//         });
//       }
//     });

//     const appJsContent = generateAppJsContent(routeImports);
//     const appJsPath = path.join(tempDir, 'app.js');
//     fs.writeFileSync(appJsPath, appJsContent);

//     const packageJsonContent = generatePackageJson(project.name, allImports);
//     const packageJsonPath = path.join(tempDir, 'package.json');
//     fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

//     const gitignoreContent = generateGitignore();
//     const gitignorePath = path.join(tempDir, '.gitignore');
//     fs.writeFileSync(gitignorePath, gitignoreContent);

//     const envContent = generateEnvTemplate();
//     const envPath = path.join(tempDir, '.env');
//     fs.writeFileSync(envPath, envContent);
//     const envExamplePath = path.join(tempDir, '.env.example');
//     fs.writeFileSync(envExamplePath, envContent);

//     const readmeContent = generateReadme(project.name, user.name || user.githubUsername);
//     const readmePath = path.join(tempDir, 'README.md');
//     fs.writeFileSync(readmePath, readmeContent);

//     console.log('✅ Project structure generated successfully');

//     const repoName = project.name
//       .trim()
//       .replace(/\s+/g, '-')
//       .replace(/[^a-zA-Z0-9-_.]/g, '')
//       .toLowerCase();

//     if (repoName.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project name contains only invalid characters for GitHub repository',
//       });
//     }

//     console.log('Sanitized repo name:', repoName);

//     const octokit = new Octokit({ auth: user.githubAccessToken });

//     let githubUser;
//     try {
//       const { data, headers } = await octokit.users.getAuthenticated();
//       githubUser = data;
//       console.log('GitHub user verified:', githubUser.login);

//       const scopes = headers['x-oauth-scopes']?.split(', ') || [];
//       console.log('Available OAuth scopes:', scopes);

//       const hasRepoScope = scopes.includes('repo') || scopes.includes('public_repo');
//       if (!hasRepoScope) {
//         return res.status(403).json({
//           success: false,
//           message: 'Insufficient GitHub permissions. Please reconnect your GitHub account with repository access.',
//           requiresGithubAuth: true,
//           requiredScopes: ['repo'],
//           currentScopes: scopes,
//           authorizationUrl: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo user:email`,
//         });
//       }
//     } catch (authError) {
//       console.error('GitHub authentication failed:', authError.message);
//       return res.status(401).json({
//         success: false,
//         message: 'GitHub authentication failed. Please reconnect your GitHub account.',
//         requiresGithubAuth: true,
//         error: authError.message,
//       });
//     }

//     let repoExists = false;
//     let existingRepo = null;
//     let repoHasCommits = false;

//     try {
//       const { data } = await octokit.repos.get({
//         owner: user.githubUsername,
//         repo: repoName,
//       });
//       repoExists = true;
//       existingRepo = data;

//       try {
//         await octokit.repos.getBranch({
//           owner: user.githubUsername,
//           repo: repoName,
//           branch: data.default_branch || 'main',
//         });
//         repoHasCommits = true;
//         console.log('✅ Repository already exists with commits');
//       } catch (branchError) {
//         if (branchError.status === 404) {
//           console.log('✅ Repository exists but is empty');
//           repoHasCommits = false;
//         } else {
//           throw branchError;
//         }
//       }
//     } catch (error) {
//       if (error.status !== 404) throw error;
//       console.log('Repository does not exist, will create new one');
//     }

//     let repo = existingRepo;

//     if (!repoExists) {
//       console.log('Creating repository...');
//       const createRepoResponse = await octokit.repos.createForAuthenticatedUser({
//         name: repoName,
//         description: project.description || `Generated backend API for ${project.name}`,
//         private: false,
//         auto_init: false,
//         has_issues: true,
//         has_projects: true,
//         has_wiki: true,
//       });
//       repo = createRepoResponse.data;
//       console.log('✅ Repository created successfully:', repo.html_url);
//     }

//     // ===== UPLOAD ALL FILES TO GITHUB (GIT TREE METHOD) =====
//     console.log('📤 Uploading files to GitHub using Git tree...');

//     const filesToUpload = getAllFiles(tempDir);
//     if (filesToUpload.length === 0) throw new Error('No files found to upload');

//     console.log(`Found ${filesToUpload.length} files to upload`);
//     const defaultBranch = repo.default_branch || 'main';

//     let baseCommitSha = null;
//     let baseTreeSha = null;

//     try {
//       const { data: refData } = await octokit.git.getRef({
//         owner: user.githubUsername,
//         repo: repoName,
//         ref: `heads/${defaultBranch}`,
//       });
//       baseCommitSha = refData.object.sha;

//       const { data: commitData } = await octokit.git.getCommit({
//         owner: user.githubUsername,
//         repo: repoName,
//         commit_sha: baseCommitSha,
//       });
//       baseTreeSha = commitData.tree.sha;
//     } catch {
//       console.log('Repo empty, initializing...');
//       const emptyTree = await octokit.git.createTree({
//         owner: user.githubUsername,
//         repo: repoName,
//         tree: [],
//       });
//       const emptyCommit = await octokit.git.createCommit({
//         owner: user.githubUsername,
//         repo: repoName,
//         message: 'Initial commit',
//         tree: emptyTree.data.sha,
//         parents: [],
//       });
//       await octokit.git.createRef({
//         owner: user.githubUsername,
//         repo: repoName,
//         ref: `refs/heads/${defaultBranch}`,
//         sha: emptyCommit.data.sha,
//       });
//       baseCommitSha = emptyCommit.data.sha;
//       baseTreeSha = emptyTree.data.sha;
//     }

//     console.log('📦 Creating blobs...');
//     const blobs = await Promise.all(
//       filesToUpload.map(async filePath => {
//         const content = fs.readFileSync(filePath, 'utf8');
//         const blob = await octokit.git.createBlob({
//           owner: user.githubUsername,
//           repo: repoName,
//           content,
//           encoding: 'utf-8',
//         });
//         const relativePath = path.relative(tempDir, filePath).replace(/\\/g, '/');
//         return { path: relativePath, mode: '100644', type: 'blob', sha: blob.data.sha };
//       })
//     );

//     console.log('🌲 Creating Git tree...');
//     const { data: newTree } = await octokit.git.createTree({
//       owner: user.githubUsername,
//       repo: repoName,
//       base_tree: baseTreeSha,
//       tree: blobs,
//     });

//     console.log('📝 Creating commit...');
//     const { data: newCommit } = await octokit.git.createCommit({
//       owner: user.githubUsername,
//       repo: repoName,
//       message: 'Add generated project files',
//       tree: newTree.sha,
//       parents: [baseCommitSha],
//     });

//     console.log('🔄 Updating branch reference...');
//     await octokit.git.updateRef({
//       owner: user.githubUsername,
//       repo: repoName,
//       ref: `heads/${defaultBranch}`,
//       sha: newCommit.sha,
//       force: true,
//     });

//     console.log('✅ Files uploaded successfully using Git tree!');
//     project.githubRepoLink = repo.html_url;
//     await project.save();

//     if (tempDir && fs.existsSync(tempDir)) {
//       fs.rmSync(tempDir, { recursive: true, force: true });
//       console.log('🧹 Cleaned up temp directory');
//     }

//     res.status(repoExists ? 200 : 201).json({
//       success: true,
//       message: repoExists
//         ? 'Code pushed to existing GitHub repository successfully'
//         : 'GitHub repository created and code pushed successfully',
//       data: {
//         repoName: repo.name,
//         repoFullName: repo.full_name,
//         repoUrl: repo.html_url,
//         cloneUrl: repo.clone_url,
//         sshUrl: repo.ssh_url,
//         description: repo.description,
//         isPrivate: repo.private,
//         createdAt: repo.created_at,
//         owner: {
//           username: repo.owner.login,
//           avatarUrl: repo.owner.avatar_url,
//           profileUrl: repo.owner.html_url,
//         },
//         filesUploaded: filesToUpload.length,
//         generatedFiles: {
//           models: modelNames.length,
//           routes: generatedRoutes.length,
//           controllers: generatedControllers.length,
//         },
//         repoAlreadyExisted: repoExists,
//       },
//     });
//   } catch (error) {
//     console.error('❌ Error creating GitHub repository:', error);
//     if (tempDir && fs.existsSync(tempDir)) {
//       fs.rmSync(tempDir, { recursive: true, force: true });
//     }
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create GitHub repository',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
//     });
//   }
// };

// Helper: recursively get all files in directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    else arrayOfFiles.push(filePath);
  });
  return arrayOfFiles;
}

const generateProjectStructure = async (req, res) => {
  try {
    const { projectId, diagramId } = req.body;

    if (!projectId || !diagramId) {
      return res.status(400).json({
        success: false,
        message: 'projectId and diagramId are required'
      });
    }

    // Fetch project details
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Fetch diagram with generated models
    const diagram = await Diagram.findById(diagramId);
    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found'
      });
    }

    // Fetch all folders (which contain APIs and imports) for this project
    const folders = await Folder.find({ projectId });

    // Create temp directory structure
    const tempDir = path.join(process.cwd(), 'temp', `project_${projectId}_${Date.now()}`);
    const modelsDir = path.join(tempDir, 'models');
    const routesDir = path.join(tempDir, 'routes');
    const controllersDir = path.join(tempDir, 'controllers');

    // Create directories
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(modelsDir, { recursive: true });
    fs.mkdirSync(routesDir, { recursive: true });
    fs.mkdirSync(controllersDir, { recursive: true });

    // Collect all imports from folders
    const allImports = new Set();
    folders.forEach(folder => {
      if (folder.imports && folder.imports.length > 0) {
        folder.imports.forEach(imp => {
          if (imp.type === 'npm') {
            allImports.add(imp.module);
          }
        });
      }
    });

    // Generate model files from diagram
    const modelNames = [];
    if (diagram.generatedModels && diagram.generatedModels.length > 0) {
      diagram.generatedModels.forEach(model => {
        const modelFileName = `${model.entityName}.js`;
        const modelFilePath = path.join(modelsDir, modelFileName);
        fs.writeFileSync(modelFilePath, model.code);
        modelNames.push(model.entityName);
      });
    }

    // Generate controller and route files from folders dynamically
    const routeImports = [];
    const generatedControllers = [];
    const generatedRoutes = [];

    folders.forEach(folder => {
      // Only generate if folder has APIs
      if (folder.apis && folder.apis.length > 0) {
        // Generate controller file dynamically from APIs
        const controllerFileName = `${folder.name}Controller.js`;
        const controllerFilePath = path.join(controllersDir, controllerFileName);
        const controllerContent = generateControllerFromAPIs(folder);
        fs.writeFileSync(controllerFilePath, controllerContent);
        generatedControllers.push(controllerFileName);

        // Generate route file dynamically from APIs
        const routeFileName = `${folder.name}Routes.js`;
        const routeFilePath = path.join(routesDir, routeFileName);
        const routeContent = generateRouteFromAPIs(folder);
        fs.writeFileSync(routeFilePath, routeContent);
        generatedRoutes.push(routeFileName);

        // Add to route imports for app.js
        routeImports.push({
          name: folder.name,
          fileName: routeFileName,
          routeName: `${folder.name}Routes`
        });
      }
    });

    // Generate app.js file
    const appJsContent = generateAppJsContent(routeImports);
    const appJsPath = path.join(tempDir, 'app.js');
    fs.writeFileSync(appJsPath, appJsContent);

    // Generate package.json with all imports
    const packageJsonContent = generatePackageJson(project.name, allImports);
    const packageJsonPath = path.join(tempDir, 'package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

    // Generate .gitignore
    const gitignoreContent = generateGitignore();
    const gitignorePath = path.join(tempDir, '.gitignore');
    fs.writeFileSync(gitignorePath, gitignoreContent);

    // Generate .env template
    const envContent = generateEnvTemplate();
    const envPath = path.join(tempDir, '.env');
    fs.writeFileSync(envPath, envContent);

    // Also generate .env.example
    const envExamplePath = path.join(tempDir, '.env.example');
    fs.writeFileSync(envExamplePath, envContent);

    // Generate README.md
    const readmeContent = generateReadme(project.name);
    const readmePath = path.join(tempDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
// Create zip file
    const zipFileName = `${project.name.replace(/\s+/g, '_')}_${Date.now()}.zip`;
    const zipFilePath = path.join(process.cwd(), 'temp', zipFileName);

    // Create a file to stream archive data to
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    // Listen for all archive data to be written
    output.on('close', function() {
      console.log(`Archive created: ${archive.pointer()} total bytes`);
      
      // Send the zip file
      res.download(zipFilePath, zipFileName, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        
        // Cleanup: delete temp directory and zip file after sending
        setTimeout(() => {
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
            fs.unlinkSync(zipFilePath);
            console.log('Cleaned up temp files');
          } catch (cleanupErr) {
            console.error('Error cleaning up files:', cleanupErr);
          }
        }, 5000); // Wait 5 seconds before cleanup
      });
    });

    // Handle archive errors
    archive.on('error', function(err) {
      console.error('Archive error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error creating zip file',
        error: err.message
      });
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Append files from the temp directory
    archive.directory(tempDir, false);

    // Finalize the archive
    await archive.finalize();

    

  } catch (error) {
    console.error('Error generating project structure:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Generate controller file content dynamically from folder APIs
 */
const generateControllerFromAPIs = (folder) => {
  let controllerContent = '';

  // Add imports at the top
  if (folder.imports && folder.imports.length > 0) {
    folder.imports.forEach(imp => {
      controllerContent += `${imp.importStatement}\n`;
      // if (imp.type === 'npm') {
        
      // } else if (imp.type === 'local') {
      //   // For local imports (models), extract just the model name
      //   const modelName = imp.module.split('/').pop();
      //   controllerContent += `const ${modelName} = require('${imp.module}');\n`;
      // } else if (imp.type === 'core') {
      //   controllerContent += `const ${imp.module} = require('${imp.module}');\n`;
      // }
    });
    controllerContent += '\n';
  }

  // Generate controller functions from APIs
  if (folder.apis && folder.apis.length > 0) {
    const controllerFunctions = folder.apis
      .map(api => {
        // Remove any leading 'const functionName =' if present in controllerCode
        const cleanedCode = api.controllerCode.replace(/^const\s+\w+\s*=\s*/, '');
        return `exports.${api.controllerName} = ${cleanedCode};`;
      })
      .join('\n\n');
    
    controllerContent += controllerFunctions;
  }

  return controllerContent;
};

/**
 * Generate route file content dynamically from folder APIs
 */
const generateRouteFromAPIs = (folder) => {
  let routeContent = '';

  // Add required imports at the top
  routeContent += `const express = require('express');\n`;
  
  // Extract controller function names from APIs
  if (folder.apis && folder.apis.length > 0) {
    const controllerFunctions = folder.apis.map(api => api.controllerName);
    
    if (controllerFunctions.length > 0) {
      const controllerName = `${folder.name}Controller`;
      routeContent += `const { ${controllerFunctions.join(', ')} } = require('../controllers/${controllerName}');\n`;
    }
  }
  
  routeContent += `const router = express.Router();\n\n`;
  
  // Generate route statements from APIs
  if (folder.apis && folder.apis.length > 0) {
    const routeStatements = folder.apis
      .map(api => `router.${api.method.toLowerCase()}('${api.endpoint}', ${api.controllerName});`)
      .join('\n');

    routeContent += routeStatements;
  }
  
  // Add module export at the end
  routeContent += '\n\nmodule.exports = router;';
  
  return routeContent;
};

/**
 * Generate app.js content with all routes
 */
const generateAppJsContent = (routeImports) => {
  let appJsContent = `const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

`;

  // Add route imports
  if (routeImports.length > 0) {
    appJsContent += `// Route imports\n`;
    routeImports.forEach(route => {
      appJsContent += `const ${route.routeName} = require('./routes/${route.fileName.replace('.js', '')}');\n`;
    });
    appJsContent += '\n';
  }

  appJsContent += `dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

`;

  // Add route usage
  if (routeImports.length > 0) {
    appJsContent += `// API Routes\n`;
    routeImports.forEach(route => {
      const routePath = route.name.toLowerCase();
      appJsContent += `app.use(\`/api/v1/${routePath}\`, ${route.routeName});\n`;
    });
    appJsContent += '\n';
  }

  appJsContent += `// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(\`Server running on Port \${PORT}\`));
})
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

module.exports = app;`;

  return appJsContent;
};

/**
 * Generate package.json with dependencies
 */
const generatePackageJson = (projectName, additionalImports) => {
  const baseDependencies = {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0"
  };

  // Add additional imports from folders
  additionalImports.forEach(imp => {
    if (!baseDependencies[imp]) {
      baseDependencies[imp] = "latest";
    }
  });

  return {
    "name": projectName.toLowerCase().replace(/\s+/g, '-'),
    "version": "1.0.0",
    "description": `Generated Node.js backend for ${projectName}`,
    "main": "app.js",
    "scripts": {
      "start": "node app.js",
      "dev": "nodemon app.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "dependencies": baseDependencies,
    "devDependencies": {
      "nodemon": "^3.0.1"
    },
    "keywords": [
      "nodejs",
      "express",
      "mongodb",
      "api",
      "backend"
    ],
    "author": "Generated by No-Code Platform",
    "license": "MIT",
    "engines": {
      "node": ">=14.0.0",
      "npm": ">=6.0.0"
    }
  };
};

/**
 * Generate .gitignore file
 */
const generateGitignore = () => {
  return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~
*.sublime-workspace
*.sublime-project

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary folders
temp/
tmp/
dist/
build/

# Database
*.sqlite
*.sqlite3
*.db
`;
};

/**
 * Generate .env template file
 */
const generateEnvTemplate = () => {
  return `# Database Configuration
DATABASE_URL=mongodb://localhost:27017/your_database_name

# Server Configuration
PORT=8001

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# API Keys
API_KEY=your_api_key_here

# Environment
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
};

/**
 * Generate README.md file
 */
const generateReadme = (projectName) => {
  return `# ${projectName}

This is an auto-generated Node.js backend project created using the No-Code Platform.

## Features

- RESTful API architecture
- MongoDB database integration
- Express.js framework
- JWT authentication support
- Input validation
- Security headers (Helmet)
- Rate limiting
- CORS enabled

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Installation

1. Clone or download this project

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables:
   - Copy \`.env.example\` to \`.env\`
   - Update the values in \`.env\` with your configuration

4. Make sure MongoDB is running

## Running the Application

### Development mode (with auto-reload):
\`\`\`bash
npm run dev
\`\`\`

### Production mode:
\`\`\`bash
npm start
\`\`\`

The server will start on \`http://localhost:8001\` (or the port specified in your .env file)

## Project Structure

\`\`\`
├── models/          # Database models (Mongoose schemas)
├── controllers/     # Request handlers
├── routes/          # API route definitions
├── app.js          # Main application file
├── package.json    # Project dependencies
├── .env            # Environment variables (not committed)
└── .gitignore      # Git ignore rules
\`\`\`

## API Endpoints

### Health Check
- **GET** \`/health\` - Check if server is running

### API Routes
Check individual route files in the \`routes/\` directory for available endpoints.

## Environment Variables

Key environment variables used in this project:

- \`DATABASE_URL\`: MongoDB connection string
- \`PORT\`: Server port (default: 8001)
- \`JWT_SECRET\`: Secret key for JWT token generation
- \`NODE_ENV\`: Environment mode (development/production)

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting to prevent abuse
- Input validation using express-validator
- JWT-based authentication

## Database

This project uses MongoDB with Mongoose ODM. Make sure your MongoDB instance is running and the connection string in \`.env\` is correct.

## Contributing

This is an auto-generated project. Modify as needed for your requirements.

## License

MIT

## Support

For issues or questions, please contact the development team.
`;
};

module.exports = {
  generateProjectStructure,
  createGithubRepo,
  deployToRender,
  getDeploymentStatus,
  deleteDeployment,
  deployToRenderWithBlueprint

};
