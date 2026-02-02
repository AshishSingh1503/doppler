const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:id', deploymentController.getDeployment);
router.get('/:id/image', deploymentController.getSignedImageUrl);

module.exports = router;
