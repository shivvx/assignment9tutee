import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import QrScanner from '../components/QrScanner';
import { Users, LogIn, Clock, CalendarCheck, ShieldCheck, Download, Check, X, AlertTriangle } from 'lucide-react';
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalTodayPasses: 0, currentlyInside: 0, pendingAppointments: 0, approvedToday: 0 });
  const [charts, setCharts] = useState({ purpose: [], weekly: [] });
  const [recentLogs, setRecentLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visitorPasses, setVisitorPasses] = useState([]);
  const [scanMessage, setScanMessage] = useState({ type: '', text: '' });
  const [activeInside, setActiveInside] = useState([]);
  const token = localStorage.getItem('token');
  const getDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      // stats cards fetch
      const statsRes = await fetch('http://localhost:5001/api/analytics/stats', { headers });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);
      // charts fetch
      const chartsRes = await fetch('http://localhost:5001/api/analytics/charts', { headers });
      const chartsData = await chartsRes.json();
      if (chartsData.success) setCharts(chartsData.charts);
      // check logs fetch for security and admin
      if (user.role === 'admin' || user.role === 'security') {
        const logsRes = await fetch('http://localhost:5001/api/checklogs', { headers });
        const logsData = await logsRes.json();
        if (logsData.success) setRecentLogs(logsData.logs.slice(0, 5));
        const activeRes = await fetch('http://localhost:5001/api/passes/active', { headers });
        const activeData = await activeRes.json();
        if (activeData.success) setActiveInside(activeData.passes);
      }
      // appointments fetch for host
      if (user.role === 'host') {
        const appRes = await fetch('http://localhost:5001/api/appointments', { headers });
        const appData = await appRes.json();
        if (appData.success) setAppointments(appData.appointments.filter(a => a.status === 'pending'));
      }
      // passes fetch for visitor
      if (user.role === 'visitor') {
        const passRes = await fetch('http://localhost:5001/api/passes', { headers });
        const passData = await passRes.json();
        if (passData.success) setVisitorPasses(passData.passes);
        const appRes = await fetch('http://localhost:5001/api/appointments', { headers });
        const appData = await appRes.json();
        if (appData.success) setAppointments(appData.appointments);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err.message);
    }
  };
  useEffect(() => {
    getDashboardData();
  }, [user.role]);
  // Security actions: QR scan success
  const handleScanSuccess = async (passId) => {
    setScanMessage({ type: '', text: '' });
    try {
      const res = await fetch('http://localhost:5001/api/checklogs/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ passId, remarks: 'Gatekeeper scan action' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Scan error');
      setScanMessage({ type: 'success', text: `${data.message} for ${data.pass.visitorName} (${data.action.toUpperCase()})` });
      getDashboardData(); // statistics update
    } catch (err) {
      setScanMessage({ type: 'error', text: err.message || 'Invalid Pass / Scanning Error' });
    }
  };
  // Host actions: approve/reject pre-registration
  const handleApprove = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5001/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Status update failed');
      getDashboardData(); // lists reload
    } catch (err) {
      alert(err.message);
    }
  };
  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header-title">
        <h1>Welcome Back, {user.name}</h1>
        <p>Your workspace is running at {user.organization || 'Acme Corp'}</p>
      </div>
      {/* 1. Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><Users size={22} color="#6366f1" /></div>
          <div className="stat-details">
            <h3>{stats.totalTodayPasses}</h3>
            <p>Total Passes Today</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><LogIn size={22} color="#10b981" /></div>
          <div className="stat-details">
            <h3>{stats.currentlyInside}</h3>
            <p>Currently Inside</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><Clock size={22} color="#f59e0b" /></div>
          <div className="stat-details">
            <h3>{stats.pendingAppointments}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><CalendarCheck size={22} color="#3b82f6" /></div>
          <div className="stat-details">
            <h3>{stats.approvedToday}</h3>
            <p>Approved Today</p>
          </div>
        </div>
      </div>
      {/* 2. Security Role Scanner Interface */}
      {(user.role === 'admin' || user.role === 'security') && (
        <div className="scanner-dashboard-section">
          <h2>Pass Quick Gatekeeper Scan</h2>
          {scanMessage.text && (
            <div className={`scan-alert ${scanMessage.type}`}>
              {scanMessage.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
              <span>{scanMessage.text}</span>
            </div>
          )}
          <QrScanner onScanSuccess={handleScanSuccess} onScanError={(err) => console.log('scanner ignored error')} />
        </div>
      )}
      {/* 3. Role Split Lists */}
      <div className="dashboard-content-split">
        {/* Left Hand Lists */}
        <div className="split-left glass-panel">
          {user.role === 'visitor' && (
            <div className="visitor-passes-dashboard">
              <h2>My Active Digital Passes</h2>
              {visitorPasses.length === 0 ? (
                <p className="no-data-msg">No active passes issued for you. Once host approves, you get your QR pass.</p>
              ) : (
                <div className="pass-badges-grid">
                  {visitorPasses.map(p => (
                    <div key={p._id} className="pass-badge-card glass-panel">
                      <div className="pass-badge-header">
                        <h4>{p.organization}</h4>
                        <span className={`pass-status ${p.status}`}>{p.status.toUpperCase()}</span>
                      </div>
                      {p.qrCode && <img src={p.qrCode} alt="Visitor QR" className="pass-badge-qr" />}
                      <div className="pass-badge-info">
                        <p><strong>Pass ID:</strong> {p.passId}</p>
                        <p><strong>Visitor:</strong> {p.visitorName}</p>
                        <p><strong>Host:</strong> {p.host ? p.host.name : 'N/A'}</p>
                        <p><strong>Valid Till:</strong> {new Date(p.validTo).toLocaleTimeString()}</p>
                      </div>
                      <a href={`http://localhost:5001/api/passes/${p._id}/pdf`} className="pdf-download-button" target="_blank" rel="noreferrer">
                        <Download size={14} style={{ marginRight: '6px' }} />
                        <span>Download PDF Badge</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
              <h2 style={{ marginTop: '20px' }}>My Appointments Status</h2>
              <div className="table-responsive">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Host</th>
                      <th>Date / Time</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a._id}>
                        <td>{a.host ? a.host.name : 'N/A'}</td>
                        <td>{new Date(a.date).toLocaleDateString()} @ {a.time}</td>
                        <td>{a.purpose}</td>
                        <td><span className={`status-pill ${a.status}`}>{a.status}</span></td>
                      </tr>
                    ))}
                    {appointments.length === 0 && <tr><td colSpan="4" className="no-data-msg">No appointments created yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {user.role === 'host' && (
            <div className="host-approvals-dashboard">
              <h2>Pending Approvals for You</h2>
              <div className="table-responsive">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Company</th>
                      <th>Date / Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a._id}>
                        <td>{a.visitorName} ({a.visitorPhone})</td>
                        <td>{a.visitorOrg || 'Personal'}</td>
                        <td>{new Date(a.date).toLocaleDateString()} @ {a.time}</td>
                        <td className="table-actions">
                          <button onClick={() => handleApprove(a._id, 'approved')} className="approve-btn" title="Approve">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleApprove(a._id, 'rejected')} className="reject-btn" title="Reject">
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && <tr><td colSpan="4" className="no-data-msg">No pending requests for approval.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {(user.role === 'admin' || user.role === 'security') && (
            <div className="recent-logs-dashboard">
              <h2>Recent Entries & Exits</h2>
              <div className="table-responsive">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Visitor</th>
                      <th>Action</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map(log => (
                      <tr key={log._id}>
                        <td>{log.passId}</td>
                        <td>{log.pass ? log.pass.visitorName : 'N/A'}</td>
                        <td><span className={`action-pill ${log.action}`}>{log.action.toUpperCase()}</span></td>
                        <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                    {recentLogs.length === 0 && <tr><td colSpan="4" className="no-data-msg">No entries logged today.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {/* Right Hand Charts Panel */}
        <div className="split-right glass-panel">
          <h2>Analytics Dashboard</h2>
          {/* Custom SVG Bar Chart */}
          <div className="chart-wrapper">
            <h4>Weekly Visit Trends (Passes Issued)</h4>
            {charts.weekly.length === 0 ? <p className="no-data-msg">No data for trends.</p> : (
              <div className="svg-bar-chart-container">
                <svg viewBox="0 0 350 180" className="svg-chart">
                  {/* Axis lines */}
                  <line x1="40" y1="140" x2="330" y2="140" stroke="#4a5568" strokeWidth="1" />
                  <line x1="40" y1="20" x2="40" y2="140" stroke="#4a5568" strokeWidth="1" />
                  {/* Bars rendering */}
                  {charts.weekly.map((item, idx) => {
                    const barWidth = 24;
                    const spacing = 14;
                    const x = 50 + idx * (barWidth + spacing);
                    // normalize height: let max scale be 10 visits max for screen
                    const maxVal = Math.max(...charts.weekly.map(w => w.value), 4);
                    const barHeight = (item.value / maxVal) * 100;
                    const y = 140 - barHeight;
                    return (
                      <g key={idx}>
                        <rect x={x} y={y} width={barWidth} height={barHeight} fill="url(#barGradient)" rx="4" className="chart-bar" />
                        {/* Bar count value above */}
                        <text x={x + barWidth/2} y={y - 5} textAnchor="middle" fill="#cbd5e0" fontSize="8" fontWeight="bold">
                          {item.value}
                        </text>
                        {/* Day label below */}
                        <text x={x + barWidth/2} y="155" textAnchor="middle" fill="#718096" fontSize="8">
                          {item.name}
                        </text>
                      </g>
                    );
                  })}
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>
          {/* Custom Visit Reason distribution progress bars */}
          <div className="chart-wrapper" style={{ marginTop: '20px' }}>
            <h4>Distribution by Visit Purpose</h4>
            {charts.purpose.length === 0 ? <p className="no-data-msg">No distribution stats.</p> : (
              <div className="custom-progress-charts">
                {charts.purpose.map((item, idx) => {
                  const total = charts.purpose.reduce((sum, current) => sum + current.value, 0);
                  const percentage = Math.round((item.value / total) * 100);
                  return (
                    <div key={idx} className="progress-row">
                      <div className="progress-labels">
                        <span className="purpose-name">{item.name}</span>
                        <span className="purpose-count">{item.value} visits ({percentage}%)</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 4. Active Inside List (Admins / Security see all active checked-in) */}
      {(user.role === 'admin' || user.role === 'security') && (
        <div className="active-visitors-dashboard glass-panel" style={{ marginTop: '25px' }}>
          <h2>Currently Active Inside Building ({activeInside.length})</h2>
          <div className="table-responsive">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Pass ID</th>
                  <th>Visitor</th>
                  <th>Company</th>
                  <th>Host Person</th>
                  <th>Check In Time</th>
                </tr>
              </thead>
              <tbody>
                {activeInside.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.passId}</strong></td>
                    <td>{p.visitorName} ({p.visitorPhone})</td>
                    <td>{p.visitorOrg || 'N/A'}</td>
                    <td>{p.host ? `${p.host.name} (${p.host.department})` : 'N/A'}</td>
                    <td>{new Date(p.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {activeInside.length === 0 && <tr><td colSpan="5" className="no-data-msg">No visitors currently inside building.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
