import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { RegisterPatient } from './pages/RegisterPatient';
import { Analytics } from './pages/Analytics';
import { CarePlan } from './pages/CarePlan';
import { PatientDetails } from './pages/PatientDetails';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main Caregiver Dashboard Routes wrapped in DashboardLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients/new" element={<RegisterPatient />} />
              <Route path="/care-plan" element={<CarePlan />} />
              <Route path="/customization" element={<CarePlan />} />
            </Route>

            {/* Patient Context Routes wrapped in PatientLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/patients/:id" element={<Navigate to="details" replace />} />
              <Route path="/patients/:id/details" element={<PatientDetails />} />
              <Route path="/patients/:id/care-plan" element={<CarePlan />} />
              <Route path="/patients/:id/analytics" element={<Analytics />} />
            </Route>

            {/* Default redirect to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
