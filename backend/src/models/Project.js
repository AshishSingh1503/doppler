const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  repoUrl: {
    type: String,
    required: true
  },
  framework: {
    type: String,
    default: 'react'
  },
  buildCommand: {
    type: String,
    default: 'npm run build'
  },
  outputDir: {
    type: String,
    default: 'build'
  },
  status: {
    type: String,
    enum: ['pending', 'building', 'deployed', 'failed'],
    default: 'pending'
  },
  deploymentUrl: {
    type: String
  },
  githubRepo: {
    type: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);