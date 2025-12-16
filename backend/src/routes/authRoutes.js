const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const githubController = require('../controllers/githubController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/github/callback', githubController.githubCallback);

module.exports = router;
