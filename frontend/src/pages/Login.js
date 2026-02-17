import React from 'react';
import { useNavigate } from 'react-router-dom';
import GitHubAuth from '../components/GitHubAuth';
import './Auth.css';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🚀 Doppler</h1>
        <h2>Sign in to continue</h2>
        <p className="auth-description">Deploy your projects with GitHub integration</p>
        
        <GitHubAuth onSuccess={() => navigate('/dashboard')} />
        
        <p className="auth-footer">By signing in, you agree to our Terms of Service</p>
      </div>
    </div>
  );
}

export default Login;
