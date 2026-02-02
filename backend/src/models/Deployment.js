const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
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
  commit: {
    type: String
  },
  branch: {
    type: String
  },
  repo: {
    provider: {
      type: String,
      enum: ['github'],
      default: 'github'
    },
    owner: {
      type: String
    },
    name: {
      type: String
    },
    url: {
      type: String
    },
    installationId: {
      type: String
    }
  },
  build: {
    dockerfilePath: {
      type: String,
      default: 'Dockerfile'
    },
    imageTag: {
      type: String
    },
    imageDigest: {
      type: String
    },
    startedAt: {
      type: Date
    },
    finishedAt: {
      type: Date
    }
  },
  storage: {
    provider: {
      type: String,
      enum: ['s3'],
      default: 's3'
    },
    bucket: {
      type: String
    },
    key: {
      type: String
    },
    region: {
      type: String
    },
    signedUrlExpiresAt: {
      type: Date
    }
  },
  proxy: {
    targetUrl: {
      type: String
    },
    publicUrl: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'queued', 'building', 'uploading', 'deploying', 'success', 'failed'],
    default: 'pending'
  },
  duration: {
    type: String
  },
  error: {
    code: {
      type: String
    },
    message: {
      type: String
    }
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
