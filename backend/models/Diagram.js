const mongoose = require('mongoose');

const generatedModelSchema = new mongoose.Schema({
  entityName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['string', 'number', 'boolean', 'date', 'text']
  },
  unique: {
    type: Boolean,
    default: false
  },
  default: {
    type: String,
    default: ''
  },
  ref: {
    type: String,
    default: ''
  }
});

const entitySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  attributes: [attributeSchema]
});

const diagramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
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
  entities: [entitySchema],
  generatedModels: [generatedModelSchema], 
  diagramUrl: {
    type: String,
    default: '',
    trim: true
  },
  metadata: {
    version: {
      type: String,
      default: '1.0.0'
    },
    createdWith: {
      type: String,
      default: 'Database Diagram Editor'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
diagramSchema.index({ projectId: 1, userId: 1 });
diagramSchema.index({ name: 1, projectId: 1 });

module.exports = mongoose.model('Diagram', diagramSchema);