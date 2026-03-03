const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubAccessToken: {
    type: String
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster GitHub user lookups
userSchema.index({ githubId: 1 });

module.exports = mongoose.model('User', userSchema);