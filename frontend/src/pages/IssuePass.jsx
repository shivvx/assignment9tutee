import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { Camera, RefreshCw, CheckCircle, Search, UserCheck, User, Mail, Phone, Building, BookOpen, Clock, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
const IssuePass = () => {
  const [appointments, setAppointments] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [org, setOrg] = useState('');
  const [hostId, setHostId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [hoursValid, setHoursValid] = useState('8');
  // Photo states
  const [photo, setPhoto] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [issuedPass, setIssuedPass] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const token = localStorage.getItem('token');
  const fetchActiveLists = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      // approved appointments list get kro
      const appRes = await fetch(`${API_URL}/appointments`, { headers });
      const appData = await appRes.json();
      if (appData.success) {
        setAppointments(appData.appointments.filter(a => a.status === 'approved'));
      }
      // hosts dropdown lists get kro
      const hostRes = await fetch(`${API_URL}/auth/hosts?organization=Acme Corp`, { headers });
      const hostData = await hostRes.json();
      if (hostData.success) setHosts(hostData.hosts);
    } catch (err) {
      console.error('Fetch data failed for issuing page:', err.message);
    }
  };
  useEffect(() => {
    fetchActiveLists();
  }, []);
  // Web camera activation
  const startCamera = async () => {
    setCameraActive(true);
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera connection failed:', err);
      setCameraError(true);
      // fallback photo generate krdo automatic canvas se
      generateFallbackAvatar();
    }
  };
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 300, 300);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setPhoto(dataUrl);
      stopCamera();
    }
  };
  // Fallback avatar maker
  const generateFallbackAvatar = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(0, 0, 150, 150);
    // Head circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(75, 55, 30, 0, Math.PI * 2);
    ctx.fill();
    // Shoulder base
    ctx.beginPath();
    ctx.arc(75, 130, 45, 0, Math.PI, true);
    ctx.fill();
    setPhoto(canvas.toDataURL('image/png'));
  };
  // Pre-registered selection click
  const selectAppointment = (app) => {
    setSelectedApp(app);
    setName(app.visitorName);
    setEmail(app.visitorEmail);
    setPhone(app.visitorPhone);
    setOrg(app.visitorOrg || '');
    setHostId(app.host ? app.host._id : '');
    setPurpose(app.purpose || '');
    if (!photo) generateFallbackAvatar();
  };
  // Reset Form
  const resetForm = () => {
    setSelectedApp(null);
    setName('');
    setEmail('');
    setPhone('');
    setOrg('');
    setHostId('');
    setPurpose('');
    setPhoto('');
    setIssuedPass(null);
    setHoursValid('8');
    fetchActiveLists();
  };
  const handleIssuePassSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      generateFallbackAvatar();
    }
    try {
      const validFrom = new Date();
      const validTo = new Date(Date.now() + parseInt(hoursValid) * 60 * 60 * 1000);
      const payload = {
        appointmentId: selectedApp ? selectedApp._id : undefined,
        visitorName: name,
        visitorEmail: email,
        visitorPhone: phone,
        visitorOrg: org,
        visitorPhoto: photo || canvasRef.current?.toDataURL('image/png'),
        hostId,
        validFrom,
        validTo,
        organization: 'Acme Corp'
      };
      const res = await fetch(`${API_URL}/passes/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Pass issue fail hogya');
      setIssuedPass(data.pass);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); // success effect!
    } catch (err) {
      alert(err.message);
    }
  };
  const filteredApps = appointments.filter(a =>
    a.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    a.visitorPhone.includes(search)
  );
  return (
    <div className="issue-pass-page animate-fade-in">
      <div className="page-header">
        <h1>Issue Digital Visitor Pass</h1>
        <p>Pre-registered appointments verify karke ya walk-in pass issue karein.</p>
      </div>
      {issuedPass ? (
        <div className="success-pass-badge glass-panel animate-fade-in">
          <div className="success-badge-header">
            <CheckCircle size={48} color="#10b981" />
            <h2>Digital Visitor Pass Issued!</h2>
            <p>Pass ID: <strong>{issuedPass.passId}</strong></p>
          </div>
          <div className="badge-visual-card glass-panel">
            <div className="badge-identity-header">
              <h3>{issuedPass.organization}</h3>
              <span>VISITOR BADGE</span>
            </div>
            <div className="badge-media-body">
              {issuedPass.visitorPhoto ? (
                <img src={issuedPass.visitorPhoto} alt="Visitor Snapshot" className="badge-media-photo" />
              ) : (
                <div className="badge-media-placeholder">No Photo</div>
              )}
              {issuedPass.qrCode && (
                <img src={issuedPass.qrCode} alt="Scannable QR" className="badge-media-qr" />
              )}
            </div>
            <div className="badge-details-footer">
              <p><strong>Name:</strong> {issuedPass.visitorName}</p>
              <p><strong>Phone:</strong> {issuedPass.visitorPhone}</p>
              <p><strong>Host:</strong> {name} (Dept: {hosts.find(h=>h._id === hostId)?.department || 'Engineering'})</p>
              <p><strong>Valid Till:</strong> {new Date(issuedPass.validTo).toLocaleString()}</p>
            </div>
          </div>
          <div className="badge-action-footer">
            <a href={`${API_URL}/passes/${issuedPass._id}/pdf`} className="pdf-download-button" target="_blank" rel="noreferrer">
              <Download size={16} style={{ marginRight: '6px' }} />
              <span>Download Printable PDF Badge</span>
            </a>
            <button onClick={resetForm} className="secondary-btn" style={{ marginTop: '10px' }}>Issue Another Pass</button>
          </div>
        </div>
      ) : (
        <div className="issue-split-container">
          {/* Left panel: list of approved appointments */}
          <div className="appointment-search-panel glass-panel">
            <h3>Approved Pre-Registrations</h3>
            <div className="input-group search-bar">
              <Search size={16} className="input-icon" />
              <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="appointment-mini-list">
              {filteredApps.map(a => (
                <div key={a._id} onClick={() => selectAppointment(a)} className={`mini-card glass-panel ${selectedApp?._id === a._id ? 'selected' : ''}`}>
                  <div className="mini-card-details">
                    <strong>{a.visitorName}</strong>
                    <span>{a.visitorPhone} | {a.visitorOrg || 'Personal'}</span>
                    <span className="mini-card-host">Host: {a.host?.name}</span>
                  </div>
                  <UserCheck size={18} color="#6366f1" />
                </div>
              ))}
              {filteredApps.length === 0 && <p className="no-data-msg">No approved appointments waiting for pass.</p>}
            </div>
          </div>
          {/* Right panel: Visitor details registration form */}
          <form onSubmit={handleIssuePassSubmit} className="pass-entry-form glass-panel">
            <h3>Pass Details {selectedApp && <span className="pre-filled-badge">Pre-Filled</span>}</h3>
            <div className="form-double-column">
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input type="text" placeholder="Visitor Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="input-group">
                <Phone size={16} className="input-icon" />
                <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="input-group">
                <Building size={16} className="input-icon" />
                <input type="text" placeholder="Visitor Organization" value={org} onChange={(e) => setOrg(e.target.value)} />
              </div>
              <div className="input-group">
                <UserCheck size={16} className="input-icon" />
                <select value={hostId} onChange={(e) => setHostId(e.target.value)} required>
                  <option value="">Select Host</option>
                  {hosts.map(h => (
                    <option key={h._id} value={h._id}>{h.name} ({h.department})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <BookOpen size={16} className="input-icon" />
                <input type="text" placeholder="Purpose of Visit" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
              </div>
              <div className="input-group">
                <Clock size={16} className="input-icon" />
                <select value={hoursValid} onChange={(e) => setHoursValid(e.target.value)}>
                  <option value="4">Valid for 4 Hours</option>
                  <option value="8">Valid for 8 Hours</option>
                  <option value="12">Valid for 12 Hours</option>
                  <option value="24">Valid for 24 Hours</option>
                </select>
              </div>
            </div>
            {/* Camera Photo Component */}
            <div className="camera-widget-container glass-panel">
              <h4>Visitor Portrait Photo</h4>
              <div className="camera-preview-box">
                {photo ? (
                  <img src={photo} alt="Captured portrait" className="preview-image" />
                ) : cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline className="preview-video"></video>
                ) : (
                  <div className="photo-portrait-placeholder">
                    <User size={48} color="#cbd5e0" />
                    <span>No photo captured</span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} width="300" height="300" style={{ display: 'none' }}></canvas>
              <div className="camera-controls">
                {!cameraActive ? (
                  <button type="button" onClick={startCamera} className="camera-btn text-icon">
                    <Camera size={14} />
                    <span>{photo ? 'Retake Photo' : 'Activate Camera'}</span>
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={capturePhoto} className="camera-btn capture-btn text-icon">
                      <CheckCircle size={14} />
                      <span>Capture Snapshot</span>
                    </button>
                    <button type="button" onClick={stopCamera} className="camera-btn stop-btn text-icon">
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
              {cameraError && <p className="camera-fallback-msg">Camera not found. Falling back to generated visitor profile portrait.</p>}
            </div>
            <button type="submit" className="login-btn full-width" style={{ marginTop: '20px' }}>Generate Digital Pass & Notify</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default IssuePass;
