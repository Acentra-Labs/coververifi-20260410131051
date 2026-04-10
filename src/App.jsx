import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import Toast from './components/shared/Toast';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contractors from './pages/Contractors';
import Subcontractors from './pages/Subcontractors';
import SubcontractorDetail from './pages/SubcontractorDetail';
import Verifications from './pages/Verifications';
import Documents from './pages/Documents';
import SettingsPage from './pages/Settings';
import AgentPortal from './pages/AgentPortal';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, isConsultant } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/verify/:token" element={<AgentPortal />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        {isConsultant && <Route path="/contractors" element={<Contractors />} />}
        <Route path="/subcontractors" element={<Subcontractors />} />
        <Route path="/subcontractors/:subId" element={<SubcontractorDetail />} />
        <Route path="/verifications" element={<Verifications />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <AppRoutes />
            <Toast />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
