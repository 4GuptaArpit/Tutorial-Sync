const mongoose = require('mongoose');

const dependencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, default: 'unknown' },
  status: { 
    type: String, 
    enum: ['deprecated', 'updated', 'current'], 
    default: 'current' 
  },
  migrationDifficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'easy' 
  }
});

const currentDependencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  docUrl: { type: String, default: '' }
});

const recommendationSchema = new mongoose.Schema({
  instead: { type: String, required: true },
  use: { type: String, required: true },
  reason: { type: String, required: true }
});

const diffSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  oldCode: { type: String, required: true },
  newCode: { type: String, required: true },
  explanation: { type: String, required: true }
});

const stepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  commands: [{ type: String }],
  codeBlocks: [{
    fileName: String,
    code: String,
    language: { type: String, default: 'javascript' }
  }],
  docLinks: [{
    title: String,
    url: String
  }],
  completed: { type: Boolean, default: false }
});

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['documentation', 'github', 'article', 'video'], 
    default: 'documentation' 
  }
});

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['tutorial-refresh', 'tech-guide'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    sourceUrl: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'analyzing', 'complete', 'error'],
      default: 'pending'
    },
    errorMessage: {
      type: String
    },
    overview: {
      originalStack: [dependencySchema],
      currentStack: [currentDependencySchema],
      recommendations: [recommendationSchema]
    },
    diffs: [diffSchema],
    steps: [stepSchema],
    resources: [resourceSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for progress computation
projectSchema.virtual('progress').get(function() {
  if (!this.steps || this.steps.length === 0) return 0;
  const completedSteps = this.steps.filter(step => step.completed).length;
  return Math.round((completedSteps / this.steps.length) * 100);
});

// Index for user-specific queries
projectSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
