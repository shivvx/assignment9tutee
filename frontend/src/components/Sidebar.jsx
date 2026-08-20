import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Calendar, Ticket, ShieldAlert, FileText, UserPlus, LogOut, Shield } from 'lucide-react';
const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate('/login'); // signout hone pe seedhe login pr feko
  };
  if (!user) return null;
  const isActive = (path) => location.pathname === path ? 'active-link' : '';
  return (
    <aside className="sidebar-container">
      <div className="brand-section">
        <Shield size={24} className="brand-logo" />
        <span className="brand-title">Gatekeeper OS</span>
      </div>
      <div className="profile-section">
        <div className="avatar-icon">{user.name.charAt(0).toUpperCase()}</div>
        <div className="profile-details">
          <span className="profile-name">{user.name}</span>
          <span className="profile-role">{user.role.toUpperCase()}</span>
        </div>
      </div>
      <nav className="nav-links">
        <Link to="/" className={`nav-item ${isActive('/')}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        {(user.role === 'admin' || user.role === 'host') && (
          <Link to="/appointments" className={`nav-item ${isActive('/appointments')}`}>
            <Calendar size={18} />
            <span>Appointments</span>
          </Link>
        )}
        {(user.role === 'admin' || user.role === 'security') && (
          <>
            <Link to="/issue-pass" className={`nav-item ${isActive('/issue-pass')}`}>
              <UserPlus size={18} />
              <span>Issue Pass</span>
            </Link>
            <Link to="/active-passes" className={`nav-item ${isActive('/active-passes')}`}>
              <Ticket size={18} />
              <span>Active Inside</span>
            </Link>
            <Link to="/scan-logs" className={`nav-item ${isActive('/scan-logs')}`}>
              <FileText size={18} />
              <span>Check Logs</span>
            </Link>
          </>
        )}
        {user.role === 'visitor' && (
          <Link to="/pre-register" className={`nav-item ${isActive('/pre-register')}`}>
            <Calendar size={18} />
            <span>Pre-Register</span>
          </Link>
        )}
        {user.role === 'admin' && (
          <Link to="/register-staff" className={`nav-item ${isActive('/register-staff')}`}>
            <ShieldAlert size={18} />
            <span>Register Staff</span>
          </Link>
        )}
      </nav>
      <div className="sidebar-footer-section">
        <button onClick={handleLogout} className="signout-button">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
