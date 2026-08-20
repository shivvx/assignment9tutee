import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Building, UserCheck, Calendar, Clock, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';
const PreRegister = () => {
  const [step, setStep] = useState(1); // 1: form, 2: otp-verify, 3: success-status
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorOrg, setVisitorOrg] = useState('');
  const [hostId, setHostId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [hosts, setHosts] = useState([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    // hosts fetch kro dropdown fill krne ke liye
    const getHosts = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/auth/hosts?organization=Acme Corp');
        const data = await res.json();
        if (data.success) setHosts(data.hosts);
      } catch (err) {
        console.error('Error fetching hosts:', err.message);
      }
    };
    getHosts();
  }, []);
  const handlePreRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5001/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorName, visitorEmail, visitorPhone, visitorOrg, hostId, date, time, purpose, organization: 'Acme Corp' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setAppointmentId(data.appointmentId);
      setOtpCode(data.otp); // testing ke liye direct state me set kr rha hu
      setStep(2); // move to OTP verification step
    } catch (err) {
      setError(err.message || 'Pre-registration failed. Check inputs.');
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/appointments/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, otp: enteredOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verify nahi hua');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Check code.');
    }
  };
  return (
    <div className="login-page">
      <div className="login-card glass-panel pre-reg-card animate-fade-in">
        <div className="login-header">
          <ShieldCheck size={36} className="login-logo" />
          <h2>Visitor Pre-Registration</h2>
          <p>Register your visit to Acme Corp</p>
        </div>
        {step === 1 && (
          <form onSubmit={handlePreRegister} className="form-grid">
            {error && <div className="error-alert full-width">{error}</div>}
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input type="text" placeholder="Your Full Name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required />
            </div>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="Your Email Address" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <Phone size={16} className="input-icon" />
              <input type="text" placeholder="Your Phone Number" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} required />
            </div>
            <div className="input-group">
              <Building size={16} className="input-icon" />
              <input type="text" placeholder="Your Company/Org" value={visitorOrg} onChange={(e) => setVisitorOrg(e.target.value)} />
            </div>
            <div className="input-group">
              <UserCheck size={16} className="input-icon" />
              <select value={hostId} onChange={(e) => setHostId(e.target.value)} required>
                <option value="">Select Host (Employee)</option>
                {hosts.map(h => (
                  <option key={h._id} value={h._id}>{h.name} - {h.department}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <Calendar size={16} className="input-icon" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="input-group">
              <Clock size={16} className="input-icon" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div className="input-group">
              <BookOpen size={16} className="input-icon" />
              <input type="text" placeholder="Purpose (e.g. Interview, Meeting)" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
            </div>
            <button type="submit" className="login-btn full-width">Send OTP Request</button>
            <div className="full-width" style={{ textAlign: 'center', marginTop: '10px' }}>
              <Link to="/login" className="highlight-link">Back to Staff Login</Link>
            </div>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="login-form">
            {error && <div className="error-alert">{error}</div>}
            <div className="mock-sms-box glass-panel">
              <h5>[NOTIFICATION SIMULATOR]</h5>
              <p>SMS to {visitorPhone}: "Your Visitor Pass OTP is <strong>{otpCode}</strong>"</p>
            </div>
            <p style={{ fontSize: '12px', textAlign: 'center', color: '#a0aec0' }}>We sent a 6-digit OTP code. Enter it below to verify.</p>
            <div className="input-group" style={{ marginTop: '10px' }}>
              <ShieldCheck size={18} className="input-icon" />
              <input type="text" placeholder="Enter 6-Digit OTP" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} required maxLength="6" style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }} />
            </div>
            <button type="submit" className="login-btn">Verify OTP</button>
            <button type="button" onClick={() => setStep(1)} className="secondary-btn" style={{ marginTop: '10px' }}>Back to Edit Details</button>
          </form>
        )}
        {step === 3 && (
          <div className="success-screen animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={60} color="#48bb78" style={{ margin: '0 auto 15px auto' }} />
            <h3>Registration Complete!</h3>
            <p style={{ color: '#cbd5e0', fontSize: '13px', margin: '10px 0 20px 0' }}>
              Your OTP is verified successfully! Your request is pending review by your host. 
              Once approved, security will issue your digital scannable QR pass at the entrance.
            </p>
            <Link to="/login" className="login-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Go to Staff Portal</Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default PreRegister;
