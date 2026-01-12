import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import Notifications from './pages/Notifications';

import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import { useAuth } from './context/AuthContext'; // Import useAuth
import { Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ScrollToTop from './components/ScrollToTop';

// Wrapper for Patient-only routes (redirects Admin/Staff to their dashboards)
const PatientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user && user.role === 'receptionist') {
    return <Navigate to="/reception" replace />;
  }
  return children;
};

// Wrapper for Admin-only routes
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Wrapper for Receptionist
const ReceptionistRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user || user.role !== 'receptionist') {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-center" />

        <Routes>
          {/* Main Website Layout (Header + Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={
              <PatientRoute>
                <Home />
              </PatientRoute>
            } />

            <Route path="/dashboard" element={
              <PatientRoute>
                <Dashboard />
              </PatientRoute>
            } />

            <Route path="/profile" element={
              <PatientRoute>
                <Profile />
              </PatientRoute>
            } />

            <Route path="/notifications" element={
              <PatientRoute>
                <Notifications />
              </PatientRoute>
            } />
          </Route>

          {/* Auth Pages (Standalone - No Header/Footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

          {/* Admin & Reception Dashboards (Standalone) */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/reception" element={
            <ReceptionistRoute>
              <ReceptionistDashboard />
            </ReceptionistRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
