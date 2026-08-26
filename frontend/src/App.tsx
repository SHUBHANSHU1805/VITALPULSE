import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientRosterPage } from './pages/PatientRosterPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ConsultationsPage } from './pages/ConsultationsPage';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen bg-vs-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-vs-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#070D1B] flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route path="/dashboard"       element={<DoctorDashboard />} />
            <Route path="/patients"        element={<PatientRosterPage />} />
            <Route path="/patients/:id"    element={<PatientDetailPage />} />
            <Route path="/consultations"   element={<ConsultationsPage />} />
            <Route path="*"               element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*"    element={<ProtectedLayout />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
