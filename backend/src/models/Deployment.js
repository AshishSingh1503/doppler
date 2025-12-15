const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  commit: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'building', 'success', 'failed'],
    default: 'pending'
  },
  duration: {
    type: String
  },
  logs: [{
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info'
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Deployment', deploymentSchema);