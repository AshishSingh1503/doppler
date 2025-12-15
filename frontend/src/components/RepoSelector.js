import React, { useState, useEffect } from 'react';
import { githubAPI } from '../api';
import './RepoSelector.css';

function RepoSelector({ onRepoSelect, selectedRepo }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const { data } = await githubAPI.getRepos();
      setRepos(data);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="repo-selector">
      <h3>Select Repository</h3>
      <input
        type="text"
        placeholder="Search repositories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="repo-search"
      />
      
      {loading ? (
        <div className="loading">Loading repositories...</div>
      ) : (
        <div className="repo-list">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className={`repo-item ${selectedRepo?.id === repo.id ? 'selected' : ''}`}
              onClick={() => onRepoSelect(repo)}
            >
              <div className="repo-info">
                <h4>{repo.name}</h4>
                <p>{repo.description || 'No description'}</p>
                <div className="repo-meta">
                  <span className="language">{repo.language}</span>
                  <span className="visibility">{repo.private ? 'Private' : 'Public'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RepoSelector;