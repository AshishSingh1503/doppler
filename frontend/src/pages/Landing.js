import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-content">
          <h1>🚀 Doppler</h1>
          <div className="nav-links">
            <Link to="/login" className="nav-btn">Sign in with GitHub</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Deploy Your Apps in Seconds</h1>
          <p className="hero-subtitle">
            Automated deployment platform that builds, containerizes, and hosts your applications
            with a simple git push. No DevOps knowledge required.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">Sign in with GitHub</Link>
            <a href="#features" className="btn-secondary">Learn More</a>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Why Choose Doppler?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Deploy in seconds with automated CI/CD pipeline powered by Jenkins and Docker</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>GitHub Integration</h3>
            <p>Connect your repository and deploy automatically on every push</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🐳</div>
            <h3>Containerized</h3>
            <p>Each project runs in isolated Docker containers for security and scalability</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Logs</h3>
            <p>Monitor your deployments with live logs and deployment history</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>AWS Powered</h3>
            <p>Built on reliable AWS infrastructure with automatic scaling</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>JWT authentication and isolated environments for each deployment</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Deploy?</h2>
        <p>Sign in with GitHub and start deploying in seconds</p>
        <Link to="/login" className="btn-primary">Sign in with GitHub</Link>
      </section>

      <footer className="landing-footer">
        <p>© 2024 Doppler. Built with ❤️ for developers.</p>
      </footer>
    </div>
  );
}

export default Landing;
