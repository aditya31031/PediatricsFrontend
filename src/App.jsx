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
import { useAuth } from './context/AuthContext'; // Import useAuth
import { Navigate } from 'react-router-dom';

// Wrapper for Patient-only routes (redirects Admin to dashboard)
const PatientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
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

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app-container">
          <Toaster position="top-center" />
          <Header />
          <main className="main-content">
            <Routes>
              {/* Wrap Patient Routes */}
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

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

              {/* Wrap Admin Route */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
