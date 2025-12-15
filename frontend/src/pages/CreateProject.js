import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api';
import RepoSelector from '../components/RepoSelector';
import './CreateProject.css';

function CreateProject() {
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('react');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [outputDir, setOutputDir] = useState('build');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    if (!projectName) {
      setProjectName(repo.name);
    }
  };

  const handleDeploy = async () => {
    if (!selectedRepo || !projectName) return;

    setLoading(true);
    try {
      const projectData = {
        name: projectName,
        repoUrl: selectedRepo.clone_url,
        framework,
        buildCommand,
        outputDir,
        githubRepo: selectedRepo
      };

      await projectAPI.create(projectData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Deployment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project">
      <div className="create-header">
        <h1>🚀 Deploy Your Project</h1>
        <p>Import your GitHub repository and deploy it instantly</p>
      </div>

      <div className="create-content">
        <div className="step">
          <h2>Step 1: Select Repository</h2>
          <RepoSelector onRepoSelect={handleRepoSelect} selectedRepo={selectedRepo} />
        </div>

        {selectedRepo && (
          <div className="step">
            <h2>Step 2: Configure Project</h2>
            <div className="config-form">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-project"
                />
              </div>

              <div className="form-group">
                <label>Framework</label>
                <select value={framework} onChange={(e) => setFramework(e.target.value)}>
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="angular">Angular</option>
                  <option value="next">Next.js</option>
                  <option value="static">Static HTML</option>
                </select>
              </div>

              <div className="form-group">
                <label>Build Command</label>
                <input
                  type="text"
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                  placeholder="npm run build"
                />
              </div>

              <div className="form-group">
                <label>Output Directory</label>
                <input
                  type="text"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  placeholder="build"
                />
              </div>
            </div>
          </div>
        )}

        {selectedRepo && (
          <div className="step">
            <h2>Step 3: Deploy</h2>
            <div className="deploy-summary">
              <h3>Deployment Summary</h3>
              <p><strong>Repository:</strong> {selectedRepo.full_name}</p>
              <p><strong>Project Name:</strong> {projectName}</p>
              <p><strong>Framework:</strong> {framework}</p>
              <p><strong>Build Command:</strong> {buildCommand}</p>
              <p><strong>Output Directory:</strong> {outputDir}</p>
            </div>
            
            <button
              onClick={handleDeploy}
              disabled={loading}
              className="deploy-btn"
            >
              {loading ? 'Deploying...' : '🚀 Deploy Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateProject;