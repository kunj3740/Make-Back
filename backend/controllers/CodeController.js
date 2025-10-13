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

    return res.status(200).json({
      success: true,
      message: 'Project structure generated successfully',
      data: {
        tempDir,
        generatedFiles: {
          models: modelNames,
          routes: generatedRoutes,
          controllers: generatedControllers,
          appJs: 'app.js',
          packageJson: 'package.json',
          gitignore: '.gitignore',
          env: '.env',
          envExample: '.env.example',
          readme: 'README.md'
        }
      }
    });

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
  generateProjectStructure
};