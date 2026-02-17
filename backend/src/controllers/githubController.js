const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.body;

    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userResponse.data;

    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (!user) {
      user = new User({
        name: githubUser.name || githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.local`,
        githubId: githubUser.id.toString(),
        avatar: githubUser.avatar_url,
        githubAccessToken: accessToken,
        password: 'github-oauth'
      });
      await user.save();
    } else {
      user.githubAccessToken = accessToken;
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
    res.status(500).json({ message: 'GitHub authentication failed', error: error.message });
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
        per_page: 100
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
    res.status(500).json({ message: 'Failed to fetch repositories', error: error.message });
  }
};