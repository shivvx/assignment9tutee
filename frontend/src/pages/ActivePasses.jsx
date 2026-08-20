import React, { useState, useEffect } from 'react';
import { LogOut, Ticket, Search, Clock } from 'lucide-react';
const ActivePasses = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');
  const getActivePasses = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/passes/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPasses(data.passes);
    } catch (err) {
      console.error('Error getting active passes list:', err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getActivePasses();
  }, []);
  const handleForceCheckout = async (passId) => {
    try {
      const res = await fetch('http://localhost:5001/api/checklogs/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ passId, remarks: 'Force checkout from active list' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      getActivePasses(); // list refresh krdo checkout hone pe
    } catch (err) {
      alert(err.message);
    }
  };
  const filteredPasses = passes.filter(p =>
    p.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    p.passId.includes(search)
  );
  return (
    <div className="active-passes-page animate-fade-in">
      <div className="page-header">
        <h1>Visitors Currently Inside Building</h1>
        <p>Real-time lists of visitors active on site. Exit gate security monitors checkout logs here.</p>
      </div>
      <div className="active-list-panel glass-panel">
        <div className="input-group search-bar" style={{ maxWidth: '400px', marginBottom: '20px' }}>
          <Search size={16} className="input-icon" />
          <input type="text" placeholder="Search by name or Pass ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="glass-loading">Fetching inside active list...</div>
        ) : (
          <div className="table-responsive">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Pass ID</th>
                  <th>Visitor Details</th>
                  <th>Host Info</th>
                  <th>Valid Window</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="pass-meta-cell">
                        <Ticket size={14} color="#6366f1" />
                        <strong>{p.passId}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="visitor-meta-cell">
                        <strong>{p.visitorName}</strong>
                        <span>{p.visitorPhone} | {p.visitorOrg || 'Personal'}</span>
                      </div>
                    </td>
                    <td>{p.host ? `${p.host.name} (${p.host.department})` : 'N/A'}</td>
                    <td>
                      <div className="validity-meta-cell">
                        <Clock size={12} color="#a0aec0" />
                        <span>Till: {new Date(p.validTo).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => handleForceCheckout(p.passId)} className="checkout-action-btn text-icon">
                        <LogOut size={12} />
                        <span>Check Out</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPasses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-data-msg">No visitors matching filter currently inside building.</td>
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
export default ActivePasses;
