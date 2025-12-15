import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { projectAPI } from '../api';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import DeploymentHistory from '../components/DeploymentHistory';
import './Dashboard.css';

function Dashboard({ setAuth }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await projectAPI.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  const handleProjectCreated = () => {
    setShowForm(false);
    fetchProjects();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🚀 Doppler Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <Link to="/create" className="new-project-btn">
            🚀 Import from GitHub
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="manual-project-btn">
            + Manual Project
          </button>
          {showForm && <ProjectForm onSuccess={handleProjectCreated} onCancel={() => setShowForm(false)} />}
          <ProjectList projects={projects} onSelect={setSelectedProject} selectedId={selectedProject?.id} />
        </div>

        <div className="main-content">
          {selectedProject ? (
            <>
              <div className="project-info">
                <h2>{selectedProject.name}</h2>
                <p><strong>Project ID:</strong> {selectedProject.id}</p>
                <p><strong>Repository:</strong> {selectedProject.repoUrl}</p>
                <p><strong>Status:</strong> <span className={`status ${selectedProject.status}`}>{selectedProject.status}</span></p>
                {selectedProject.deploymentUrl && (
                  <p><strong>URL:</strong> <a href={selectedProject.deploymentUrl} target="_blank" rel="noopener noreferrer">{selectedProject.deploymentUrl}</a></p>
                )}
              </div>
              <DeploymentHistory projectId={selectedProject.id} />
            </>
          ) : (
            <div className="empty-state">
              <h2>Welcome to Doppler</h2>
              <p>Create a new project or select an existing one to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
