import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function GitHubCallback({ setAuth }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        console.error('GitHub OAuth error:', errorParam, errorDescription);
        setError(errorDescription || 'GitHub authorization was denied');
        setTimeout(() => navigate('/login?error=github_auth_failed'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const { data } = await githubAPI.authCallback(code);
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setAuth(true);
        navigate('/dashboard');
      } catch (err) {
        console.error('GitHub callback error:', err);
        const errorMsg = err.response?.data?.message || 'Authentication failed';
        setError(errorMsg);
        setTimeout(() => navigate('/login?error=github_auth_failed'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, #0f1419 50%, var(--bg-primary) 100%)',
      color: 'var(--text-primary)',
      padding: '20px'
    }}>
      {error ? (
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '32px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-primary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ marginBottom: '12px', color: 'var(--accent-danger)' }}>Authentication Failed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Redirecting to login...</p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '32px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-primary)'
        }}>
          <LoadingSpinner size="lg" text="" />
          <h2 style={{ marginTop: '24px', marginBottom: '12px' }}>Authenticating with GitHub</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please wait while we complete your login...</p>
        </div>
      )}
    </div>
  );
}

export default GitHubCallback;