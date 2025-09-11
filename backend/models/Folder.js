const mongoose = require('mongoose');

const inputSchema = new mongoose.Schema({
  params: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  query: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  body: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const expectedOutputSchema = new mongoose.Schema({
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const testCaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  input: inputSchema,
  expectedOutput: expectedOutputSchema,
  description: {
    type: String,
    default: ''
  }
});

const apiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    uppercase: true
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  controllerCode: {
    type: String,
    required: true
  },
  testCases: [testCaseSchema],
  documentation: {
    summary: {
      type: String,
      default: ''
    },
    parameters: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        default: ''
      },
      location: {
        type: String,
        enum: ['query', 'body', 'params', 'headers'],
        default: 'body'
      },
      _id: false // This prevents Mongoose from adding _id to each parameter
    }]
  }
  
});

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: ''
  },
  commonPrompt:{
    type: String,
    default: ''
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  apis: [apiSchema]
}, {
  timestamps: true
});

// Indexes for better performance
folderSchema.index({ projectId: 1, userId: 1 });
folderSchema.index({ name: 1, projectId: 1 });
folderSchema.index({ 'apis.method': 1, 'apis.endpoint': 1, projectId: 1 });

module.exports = mongoose.model('Folder', folderSchema);