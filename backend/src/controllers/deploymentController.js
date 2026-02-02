const Project = require('../models/Project');
const Deployment = require('../models/Deployment');
const { runDeployment, createSignedUrl } = require('../services/deploymentService');

exports.createDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commit, branch, dockerfilePath } = req.body;
    const userId = req.user.id;

    const project = await Project.findOne({ _id: id, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const deployment = new Deployment({
      projectId: project._id,
      userId,
      commit,
      branch,
      repo: {
        provider: 'github',
        url: project.repoUrl
      },
      build: {
        dockerfilePath: dockerfilePath || 'Dockerfile'
      },
      status: 'queued',
      logs: [
        { level: 'info', message: 'Deployment queued', timestamp: new Date() }
      ]
    });

    await deployment.save();

    setImmediate(() => {
      runDeployment({ deployment, project }).catch(() => {});
    });

    res.status(201).json(deployment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create deployment', error: error.message });
  }
};

exports.getDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    const deployment = await Deployment.findOne({ _id: id, userId: req.user.id });
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch deployment', error: error.message });
  }
};

exports.getSignedImageUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const deployment = await Deployment.findOne({ _id: id, userId: req.user.id });
    if (!deployment || !deployment.storage || !deployment.storage.bucket || !deployment.storage.key) {
      return res.status(404).json({ message: 'Deployment image not found' });
    }

    const signed = await createSignedUrl({
      bucket: deployment.storage.bucket,
      key: deployment.storage.key
    });

    res.json({ url: signed.url, expiresAt: signed.expiresAt });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create signed URL', error: error.message });
  }
};
