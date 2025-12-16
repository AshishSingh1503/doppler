const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/callback', githubController.githubCallback);
router.get('/repos', authMiddleware, githubController.getRepos);

module.exports = router;