const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { v2: cloudinary } = require('cloudinary');
const { v4: uuidv4 } = require('uuid');
const dotenv = require("dotenv");
const Diagram = require('../models/Diagram');
dotenv.config();


const execAsync = promisify(exec);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class MermaidController {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDirectory();
  }

  async ensureTempDirectory() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Generate image from Mermaid code and upload to Cloudinary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateAndUploadDiagram(req, res) {
    console.log('📥 Request received');
    const mermaidCode = req.body.mermaidCode;
    const format = 'png';
    const theme = 'default';

    const sessionId = uuidv4();
    const inputFile = path.join(this.tempDir, `${sessionId}.mmd`);
    const outputFile = path.join(this.tempDir, `${sessionId}.${format}`);

    try {
        // Step 1: Write Mermaid code to temporary file
        await this.writeMermaidFile(inputFile, mermaidCode);
        console.log(`📝 Mermaid file created: ${inputFile}`);

        // Step 2: Generate image using Mermaid CLI
        const imagePath = await this.generateImage(inputFile, outputFile, format, theme);
        console.log(`🖼️  Image generated: ${imagePath}`);

        // Step 3: Upload to Cloudinary
        const cloudinaryUrl = await this.uploadToCloudinary(imagePath, sessionId, format);
        console.log(`☁️  Uploaded to Cloudinary: ${cloudinaryUrl}`);

        // Step 4: Clean up temporary files
        await this.cleanup([inputFile, outputFile]);
        console.log(`🧹 Temporary files cleaned up`);

        const updatedDiagram = await Diagram.findByIdAndUpdate(
            req.body.diagramId,
            {
              diagramUrl: cloudinaryUrl,
            },
            { new: true, runValidators: true }
          );

        req.body.diagramUrl = cloudinaryUrl
        // // Step 5: Return success response
        return res.status(200).json({
        success: true,
        data: {
            diagramUrl: cloudinaryUrl,
        }
        });

    } catch (error) {
        console.error('Error in generateAndUploadDiagram:', error);

        // Cleanup on error
        await this.cleanup([inputFile, outputFile]);

        return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
    }


  /**
   * Write Mermaid code to file
   */
  async writeMermaidFile(filePath, mermaidCode) {
    try {
      await fs.writeFile(filePath, mermaidCode.trim(), 'utf8');
    } catch (error) {
      throw new Error(`Failed to write Mermaid file: ${error.message}`);
    }
  }

  /**
   * Generate image using Mermaid CLI
   */
  async generateImage(inputFile, outputFile, format, theme) {
    try {
      // Construct Mermaid CLI command
      // const command = `npx @mermaid-js/mermaid-cli -i "${inputFile}" -o "${outputFile}" -t "${theme}" -f ${format} --quiet`;
      const command = `npx @mermaid-js/mermaid-cli -i "${inputFile}" -o "${outputFile}" -t "${theme}" --quiet`;
      
      console.log(`🔄 Executing: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: 50000, // 30 seconds timeout
        cwd: process.cwd()
      });

      if (stderr && !stderr.includes('info')) {
        console.warn('Mermaid CLI stderr:', stderr);
      }

      // Verify file was created
      const stats = await fs.stat(outputFile);
      if (!stats.isFile()) {
        throw new Error('Generated image file not found');
      }

      return outputFile;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Mermaid CLI not found. Please install @mermaid-js/mermaid-cli');
      }
      if (error.signal === 'SIGTERM') {
        throw new Error('Mermaid CLI timed out. Complex diagram may need more time');
      }
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadToCloudinary(imagePath, sessionId, format) {
    try {
      const uploadOptions = {
        folder: 'mermaid-diagrams',
        public_id: `diagram_${sessionId}`,
        resource_type: 'image',
        format: format,
        overwrite: true,
        invalidate: true,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      };

      const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
      
      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(filePaths) {
    const cleanupPromises = filePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, which is fine
        if (error.code !== 'ENOENT') {
          console.warn(`Failed to delete ${filePath}:`, error.message);
        }
      }
    });

    await Promise.all(cleanupPromises);
  }

  /**
   * Health check endpoint to verify setup
   */
  async healthCheck(req, res) {
    try {
      // Check Mermaid CLI availability
      await execAsync('npx @mermaid-js/mermaid-cli --version', { timeout: 10000 });
      
      // Check Cloudinary configuration
      const cloudinaryConfigured = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );

      return res.status(200).json({
        success: true,
        status: 'healthy',
        checks: {
          mermaidCli: 'available',
          cloudinary: cloudinaryConfigured ? 'configured' : 'not configured',
          tempDirectory: 'accessible'
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}

// Export controller instance
const mermaidController = new MermaidController();

// Export controller methods for use in routes
module.exports = {
  generateAndUploadDiagram: mermaidController.generateAndUploadDiagram.bind(mermaidController),
  healthCheck: mermaidController.healthCheck.bind(mermaidController)
};

// Example usage with Express routes:
/*
const express = require('express');
const router = express.Router();
const { generateAndUploadDiagram, healthCheck } = require('./controllers/mermaidController');

// POST /api/mermaid/generate
router.post('/generate', generateAndUploadDiagram);

// GET /api/mermaid/health
router.get('/health', healthCheck);

module.exports = router;
*/

// Example request body:
/*
{
  "mermaidCode": "flowchart TD\nA[\"Limited Interactivity and Accessibility\"] --> B[\"Current Challenges\"]\nB --> C[\"Delayed Reporting\"] & D[\"Lack of Visibility\"] & E[\"Delayed Response\"] & F[\"Limited Engagement\"]\nC --> G[\"Reduced Response Times\"]\nD --> H[\"Citizens Unaware of Crime Activities\"]\nE --> I[\"Delayed Law Enforcement Response\"]\nF --> J[\"Communication Gap\"]",
  "format": "png",
  "theme": "default"
}
*/