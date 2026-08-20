import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { FileText, Search, Shield } from 'lucide-react';
const ScanLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');
  const getLogsList = async () => {
    try {
      const res = await fetch(`${API_URL}/checklogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (err) {
      console.error('Error fetching logs:', err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getLogsList();
  }, []);
  const filteredLogs = logs.filter(l =>
    l.passId.toLowerCase().includes(search.toLowerCase()) ||
    (l.pass && l.pass.visitorName.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="logs-page animate-fade-in">
      <div className="page-header">
        <h1>Gate Entry & Exit Logs</h1>
        <p>Complete security check audit history for all visitor passes issued.</p>
      </div>
      <div className="logs-list-panel glass-panel">
        <div className="input-group search-bar" style={{ maxWidth: '400px', marginBottom: '20px' }}>
          <Search size={16} className="input-icon" />
          <input type="text" placeholder="Search by Pass ID or Visitor name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="glass-loading">Loading audit check logs...</div>
        ) : (
          <div className="table-responsive">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Pass ID</th>
                  <th>Visitor</th>
                  <th>Host Reference</th>
                  <th>Gate Action</th>
                  <th>Processed By</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><strong>{log.passId}</strong></td>
                    <td>{log.pass ? log.pass.visitorName : 'N/A'}</td>
                    <td>{log.pass && log.pass.host ? `${log.pass.host.name} (${log.pass.host.department})` : 'N/A'}</td>
                    <td>
                      <span className={`action-pill-cell ${log.action}`}>{log.action.toUpperCase()}</span>
                    </td>
                    <td>
                      <div className="staff-reference-meta">
                        <Shield size={12} color="#a0aec0" />
                        <span>{log.performedBy ? log.performedBy.name : 'System'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="no-data-msg">No gate logs recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default ScanLogs;
