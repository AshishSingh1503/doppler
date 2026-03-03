const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ message: 'Failed to obtain access token' });
    }

    // Fetch user data
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userResponse.data;

    // Fetch email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const primaryEmail = emailResponse.data.find(e => e.primary);
      email = primaryEmail ? primaryEmail.email : `${githubUser.login}@users.noreply.github.com`;
    }

    // Find or create user
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (!user) {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser && !existingUser.githubId) {
        // Link GitHub to existing account
        existingUser.githubId = githubUser.id.toString();
        existingUser.githubAccessToken = accessToken;
        existingUser.avatar = githubUser.avatar_url;
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = new User({
          name: githubUser.name || githubUser.login,
          email: email,
          githubId: githubUser.id.toString(),
          avatar: githubUser.avatar_url,
          githubAccessToken: accessToken,
          password: crypto.randomBytes(32).toString('hex') // Random password for OAuth users
        });
        await user.save();
      }
    } else {
      // Update existing GitHub user
      user.githubAccessToken = accessToken;
      user.avatar = githubUser.avatar_url;
      user.name = githubUser.name || githubUser.login;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('GitHub authentication error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'GitHub authentication failed', 
      error: error.response?.data?.message || error.message 
    });
  }
};

exports.getRepos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ message: 'GitHub account not linked' });
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 100,
        affiliation: 'owner,collaborator'
      }
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      private: repo.private,
      clone_url: repo.clone_url,
      html_url: repo.html_url,
      updated_at: repo.updated_at,
      default_branch: repo.default_branch
    }));

    res.json(repos);
  } catch (error) {
    console.error('Failed to fetch repositories:', error.response?.data || error.message);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        message: 'GitHub token expired. Please re-authenticate with GitHub.',
        requiresReauth: true
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch repositories', 
      error: error.response?.data?.message || error.message 
    });
  }
};