import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import IssuePass from './pages/IssuePass';
import ActivePasses from './pages/ActivePasses';
import ScanLogs from './pages/ScanLogs';
import PreRegister from './pages/PreRegister';
import RegisterStaff from './pages/RegisterStaff';
// Protected route component setup
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="glass-loading">Sabar karo, Loading chal rha h...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="content-container">
        {children}
      </main>
    </div>
  );
};
function AppRoutes() {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/pre-register" element={<PreRegister />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['admin', 'host']}>
          <Appointments />
        </ProtectedRoute>
      } />
      <Route path="/issue-pass" element={
        <ProtectedRoute allowedRoles={['admin', 'security']}>
          <IssuePass />
        </ProtectedRoute>
      } />
      <Route path="/active-passes" element={
        <ProtectedRoute allowedRoles={['admin', 'security']}>
          <ActivePasses />
        </ProtectedRoute>
      } />
      <Route path="/scan-logs" element={
        <ProtectedRoute allowedRoles={['admin', 'security']}>
          <ScanLogs />
        </ProtectedRoute>
      } />
      <Route path="/register-staff" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <RegisterStaff />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
