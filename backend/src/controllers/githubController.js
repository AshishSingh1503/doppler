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
        password: 'github-oauth'
      });
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
    const mockRepos = [
      {
        id: 1,
        name: 'my-react-app',
        full_name: 'user/my-react-app',
        description: 'A React application',
        language: 'JavaScript',
        private: false,
        clone_url: 'https://github.com/user/my-react-app.git'
      },
      {
        id: 2,
        name: 'portfolio-website',
        full_name: 'user/portfolio-website',
        description: 'My personal portfolio',
        language: 'HTML',
        private: false,
        clone_url: 'https://github.com/user/portfolio-website.git'
      }
    ];

    res.json(mockRepos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch repositories', error: error.message });
  }
};