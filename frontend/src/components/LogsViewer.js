import React, { useState, useEffect } from 'react';
import { projectAPI } from '../api';
import './LogsViewer.css';

function LogsViewer({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [projectId]);

  const fetchLogs = async () => {
    try {
      const { data } = await projectAPI.getLogs(projectId);
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logs-viewer">
      <h3>📝 Build Logs</h3>
      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="no-logs">No logs available</p>
      ) : (
        <div className="logs-container">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.level}`}>
              <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LogsViewer;
