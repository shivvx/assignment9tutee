import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Check, X, Building, BookOpen, Clock, User } from 'lucide-react';
const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);
  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approval action failed');
      fetchAppointments(); // refresh list
    } catch (err) {
      alert(err.message);
    }
  };
  return (
    <div className="appointments-page animate-fade-in">
      <div className="page-header">
        <h1>Pre-Registration Appointments</h1>
        <p>Review and manage visitor entries requesting access.</p>
      </div>
      {loading ? (
        <div className="glass-loading">Loading appointments data...</div>
      ) : (
        <div className="appointments-list-container glass-panel">
          <div className="table-responsive">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Company</th>
                  <th>Host Info</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div className="visitor-meta-cell">
                        <strong>{app.visitorName}</strong>
                        <span>{app.visitorPhone}</span>
                      </div>
                    </td>
                    <td>{app.visitorOrg || 'Personal'}</td>
                    <td>{app.host ? `${app.host.name} (${app.host.department})` : 'N/A'}</td>
                    <td>{new Date(app.date).toLocaleDateString()} @ {app.time}</td>
                    <td>{app.purpose}</td>
                    <td>
                      <span className={`status-pill ${app.status}`}>{app.status}</span>
                    </td>
                    <td className="table-actions">
                      {app.status === 'pending' ? (
                        <>
                          <button onClick={() => handleStatusChange(app._id, 'approved')} className="approve-btn-action" title="Approve Request">
                            <Check size={14} />
                            <span>Approve</span>
                          </button>
                          <button onClick={() => handleStatusChange(app._id, 'rejected')} className="reject-btn-action" title="Reject Request">
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="action-completed-label">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-data-msg">No pre-registrations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Appointments;
