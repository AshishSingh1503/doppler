const express = require('express');
const router = express.Router();
const S3ProxyService = require('../services/s3ProxyService');
const authMiddleware = require('../middleware/authMiddleware');

const s3Proxy = new S3ProxyService();

router.get('/images/:projectId/:filename', authMiddleware, async (req, res) => {
  try {
    const { projectId, filename } = req.params;
    const signedUrl = await s3Proxy.getDockerImageUrl(projectId, filename);
    res.json({ url: signedUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/dockerfiles/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const signedUrl = await s3Proxy.getDockerfileUrl(projectId);
    res.json({ url: signedUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stream/images/:projectId/:filename', authMiddleware, async (req, res) => {
  try {
    const { projectId, filename } = req.params;
    const key = `docker-images/${projectId}/${filename}`;
    await s3Proxy.streamFromS3(key, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;