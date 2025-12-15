const Project = require('../models/Project');
const Deployment = require('../models/Deployment');

exports.createProject = async (req, res) => {
  try {
    const { name, projectId, repoUrl, framework, buildCommand, outputDir, githubRepo } = req.body;
    const userId = req.user.id;

    const existingProject = await Project.findOne({ projectId });
    if (existingProject) {
      return res.status(400).json({ message: 'Project ID already exists' });
    }

    const project = new Project({
      userId,
      name,
      projectId: projectId || name.toLowerCase().replace(/\s+/g, '-'),
      repoUrl,
      framework,
      buildCommand,
      outputDir,
      githubRepo
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ _id: id, userId: req.user.id });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};

exports.getDeployments = async (req, res) => {
  try {
    const { id } = req.params;
    const deployments = await Deployment.find({ projectId: id }).sort({ createdAt: -1 });
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch deployments', error: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const deployments = await Deployment.find({ projectId: id }).sort({ createdAt: -1 }).limit(1);
    
    if (deployments.length === 0) {
      return res.json([]);
    }
    
    res.json(deployments[0].logs || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
};