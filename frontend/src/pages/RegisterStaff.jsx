import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, User, Mail, Shield, ShieldCheck, Key, Phone, Building } from 'lucide-react';
const RegisterStaff = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('host');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState([]);
  const token = localStorage.getItem('token');
  const getStaffUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/hosts?organization=Acme Corp`);
      const data = await res.json();
      if (data.success) {
        setStaffList(data.hosts);
      }
    } catch (err) {
      console.error('Error fetching staff list:', err.message);
    }
  };
  useEffect(() => {
    getStaffUsers();
  }, []);
  const handleRegisterStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        department: role === 'host' ? department : undefined,
        organization: 'Acme Corp'
      };
      const data = await register(payload);
      setSuccess(`Account of ${name} (${role.toUpperCase()}) created successfully!`);
      // reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('host');
      setDepartment('');
      setPhone('');
      getStaffUsers(); // refresh active staff list
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };
  return (
    <div className="register-staff-page animate-fade-in">
      <div className="page-header">
        <h1>Register New Staff Members</h1>
        <p>Create credentials for Hosts (Employees) and Security/Frontdesk users.</p>
      </div>
      <div className="staff-split-container">
        {/* Form container */}
        <form onSubmit={handleRegisterStaffSubmit} className="staff-registration-form glass-panel">
          <h3>Create Staff Profile</h3>
          {success && <div className="success-alert">{success}</div>}
          {error && <div className="error-alert">{error}</div>}
          <div className="input-group">
            <User size={16} className="input-icon" />
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <Mail size={16} className="input-icon" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <Key size={16} className="input-icon" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <Phone size={16} className="input-icon" />
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="input-group">
            <Shield size={16} className="input-icon" />
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="host">Host / Employee</option>
              <option value="security">Security / Frontdesk</option>
            </select>
          </div>
          {role === 'host' && (
            <div className="input-group">
              <Building size={16} className="input-icon" />
              <input type="text" placeholder="Department (e.g. Finance, Tech)" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </div>
          )}
          <button type="submit" className="login-btn full-width">Create Staff Account</button>
        </form>
        {/* List of active staff */}
        <div className="active-staff-list-container glass-panel">
          <h3>Current Active Hosts ({staffList.length})</h3>
          <div className="table-responsive">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff._id}>
                    <td><strong>{staff.name}</strong></td>
                    <td>{staff.department || 'Security Staff'}</td>
                    <td>{staff.email} <br /> {staff.phone}</td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan="3" className="no-data-msg">No active host profiles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterStaff;
