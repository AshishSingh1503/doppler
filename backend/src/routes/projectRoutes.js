const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const deploymentController = require('../controllers/deploymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.get('/:id/deployments', projectController.getDeployments);
router.get('/:id/logs', projectController.getLogs);
router.post('/:id/deploy', deploymentController.createDeployment);

module.exports = router;
