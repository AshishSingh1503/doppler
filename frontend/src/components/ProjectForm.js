import React, { useState } from 'react';
import { projectAPI } from '../api';
import './ProjectForm.css';

function ProjectForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    repoUrl: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await projectAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="project-form">
      <h3>Create New Project</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Project Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Project ID"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          required
        />
        <input
          type="url"
          placeholder="GitHub Repository URL"
          value={formData.repoUrl}
          onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
          required
        />
        <div className="form-actions">
          <button type="submit">Create</button>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default ProjectForm;
