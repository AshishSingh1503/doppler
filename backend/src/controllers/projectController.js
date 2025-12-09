const { pool } = require('../config/database');

exports.createProject = async (req, res) => {
  try {
    const { name, projectId, repoUrl } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'INSERT INTO projects (user_id, name, project_id, repo_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, projectId, repoUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};

exports.getDeployments = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM deployments WHERE project_id = $1 ORDER BY created_at DESC', [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch deployments', error: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM logs WHERE project_id = $1 ORDER BY timestamp DESC LIMIT 100', [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
};
