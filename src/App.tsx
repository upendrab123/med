import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Components
import LoginPage from './components/auth/LoginPage';

// Dashboard Components
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import LabDashboard from './components/dashboard/LabDashboard';
import PharmacyDashboard from './components/dashboard/PharmacyDashboard';

// Patient Components
import PatientRegistrationForm from './components/patient/PatientRegistrationForm';
import PatientTimeline from './components/patient/PatientTimeline';
import PrescriptionForm from './components/patient/PrescriptionForm';

// Admin Components
import UserManagement from './components/admin/UserManagement';

// Types
import { UserRole } from './types';

// Route Guard Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};

// App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Doctor Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roles={[UserRole.DOCTOR]}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/patients/register" 
            element={
              <ProtectedRoute roles={[UserRole.DOCTOR, UserRole.ADMIN]}>
                <PatientRegistrationForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Lab Staff Routes */}
          <Route 
            path="/lab-reports" 
            element={
              <ProtectedRoute roles={[UserRole.LAB_STAFF]}>
                <LabDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Pharmacy Staff Routes */}
          <Route 
            path="/pharmacy" 
            element={
              <ProtectedRoute roles={[UserRole.PHARMACY_STAFF]}>
                <PharmacyDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={[UserRole.ADMIN]}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Route */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" />} 
          />
          
          {/* Unauthorized Route */}
          <Route 
            path="/unauthorized" 
            element={
              <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <h1>Unauthorized Access</h1>
                <p>You do not have permission to access this page.</p>
              </div>
            } 
          />
          
          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
              </div>
            } 
          />
        </Routes>
      </Router>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
};

export default App;
