import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Landing } from './pages/Landing';
import { Application } from './pages/Application';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { Patients } from './pages/Patients';
import { PatientDetails } from './pages/PatientDetails';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { NewPatient } from './pages/NewPatient';

// Layout for the internal app (Sidebar + Header)
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex font-sans text-genesis-dark selection:bg-genesis-blue/20 selection:text-genesis-blue">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Public Application Page (Premium) */}
          <Route path="/apply" element={<Application />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected App Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/new" element={<NewPatient />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<div className="flex items-center justify-center h-full text-genesis-medium font-medium">Configurações (Em breve)</div>} />
            <Route path="/help" element={<div className="flex items-center justify-center h-full text-genesis-medium font-medium">Ajuda & Suporte</div>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<div className="flex items-center justify-center h-screen text-genesis-medium">Página não encontrada</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;