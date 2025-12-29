import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
// import Register from './pages/Register'; // Removed public registration
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import History from './pages/History';
import AdminPending from './pages/AdminPending';
import AdminAllForms from './pages/AdminAllForms';
import AdminUserManagement from './pages/AdminUserManagement'; // New component
import FormDetails from './pages/FormDetails';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* <Route path="/register" element={<Register />} /> */}

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/new-entry"
            element={
              <ProtectedRoute>
                <NewEntry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPending />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/all-forms"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminAllForms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forms/:id"
            element={
              <ProtectedRoute>
                <FormDetails />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
