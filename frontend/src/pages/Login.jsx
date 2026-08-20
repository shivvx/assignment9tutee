import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Key, Mail, ArrowRight } from 'lucide-react';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); // dashboard pr redirect
    } catch (err) {
      setError(err.message || 'Kuch error aayi login me. Credentials check karo.');
    } finally {
      setLoading(false);
    }
  };
  // helper to quickly fill credentials for quick testing
  const handleQuickFill = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
  };
  return (
    <div className="login-page">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <Shield size={40} className="login-logo" />
          <h2>Gatekeeper OS</h2>
          <p>Visitor Pass Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-alert">{error}</div>}
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <Key size={18} className="input-icon" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
            <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        </form>
        <div className="visitor-register-link-container">
          <span>Are you a visitor? </span>
          <Link to="/pre-register" className="highlight-link">Pre-Register Visit Here</Link>
        </div>
        <div className="demo-accounts-container">
          <h4>Quick Test Accounts (Click to Fill)</h4>
          <div className="demo-badge-grid">
            <button onClick={() => handleQuickFill('admin@gatekeeper.com', 'password123')} className="demo-badge admin">
              <span>Admin</span>
            </button>
            <button onClick={() => handleQuickFill('security@gatekeeper.com', 'password123')} className="demo-badge security">
              <span>Security</span>
            </button>
            <button onClick={() => handleQuickFill('amit@gatekeeper.com', 'password123')} className="demo-badge host">
              <span>Host</span>
            </button>
            <button onClick={() => handleQuickFill('karan@visitor.com', 'password123')} className="demo-badge visitor">
              <span>Visitor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
