import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubAPI } from '../api';

function GitHubCallback({ setAuth }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('GitHub OAuth error:', error);
        navigate('/login?error=github_auth_failed');
        return;
      }

      if (code) {
        try {
          const { data } = await githubAPI.authCallback(code);
          localStorage.setItem('token', data.token);
          setAuth(true);
          navigate('/dashboard');
        } catch (err) {
          console.error('GitHub callback error:', err);
          navigate('/login?error=github_auth_failed');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#0d1117',
      color: '#c9d1d9'
    }}>
      <div>
        <h2>🔄 Authenticating with GitHub...</h2>
        <p>Please wait while we complete your login.</p>
      </div>
    </div>
  );
}

export default GitHubCallback;