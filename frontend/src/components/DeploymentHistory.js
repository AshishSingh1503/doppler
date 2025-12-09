import React, { useState, useEffect } from 'react';
import { projectAPI } from '../api';
import './DeploymentHistory.css';

function DeploymentHistory({ projectId }) {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeployments();
  }, [projectId]);

  const fetchDeployments = async () => {
    try {
      const { data } = await projectAPI.getDeployments(projectId);
      setDeployments(data);
    } catch (err) {
      console.error('Failed to fetch deployments', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deployment-history">
      <h3>📊 Deployment History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : deployments.length === 0 ? (
        <p className="no-data">No deployments yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Commit</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((deployment) => (
              <tr key={deployment.id}>
                <td>{new Date(deployment.createdAt).toLocaleString()}</td>
                <td>{deployment.commit?.substring(0, 7) || 'N/A'}</td>
                <td><span className={`status ${deployment.status}`}>{deployment.status}</span></td>
                <td>{deployment.duration || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DeploymentHistory;
