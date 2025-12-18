import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ClinicProvider, useClinicContext } from './contexts/ClinicContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Landing } from './pages/Landing';
import { Application } from './pages/Application';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { Patients } from './pages/Patients';
import { PatientDetails } from './pages/PatientDetails';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { NewPatient } from './pages/NewPatient';
import { EditPatient } from './pages/EditPatient';
import { Loader2 } from 'lucide-react';

/**
 * Loading spinner component for async operations.
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-genesis-soft">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-genesis-blue animate-spin" />
        <span className="text-genesis-medium font-medium">Carregando...</span>
      </div>
    </div>
  );
}

/**
 * Guard component that redirects to onboarding if user has no clinic.
 */
function RequireClinic({ children }: { children: React.ReactNode }) {
  const { loading, needsOnboarding } = useClinicContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

/**
 * Guard component that redirects to dashboard if user already has a clinic.
 */
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { loading, needsOnboarding, clinicId } = useClinicContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If user already has a clinic, redirect to dashboard
  if (!needsOnboarding && clinicId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/**
 * Layout for the internal app (Sidebar + Header).
 */
function AppLayout() {
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
}

function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <Router>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Public Application Page (Premium) */}
            <Route path="/apply" element={<Application />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Onboarding Route (requires auth, but no clinic) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Onboarding />
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            {/* Protected App Routes (requires auth + clinic) */}
            <Route
              element={
                <ProtectedRoute>
                  <RequireClinic>
                    <AppLayout />
                  </RequireClinic>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/new" element={<NewPatient />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/patients/:id/edit" element={<EditPatient />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/reports" element={<Reports />} />
              <Route
                path="/settings"
                element={
                  <div className="flex items-center justify-center h-full text-genesis-medium font-medium">
                    Configurações (Em breve)
                  </div>
                }
              />
              <Route
                path="/help"
                element={
                  <div className="flex items-center justify-center h-full text-genesis-medium font-medium">
                    Ajuda & Suporte
                  </div>
                }
              />
            </Route>

            {/* Catch all */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center h-screen text-genesis-medium">
                  Página não encontrada
                </div>
              }
            />
          </Routes>
        </Router>
      </ClinicProvider>
    </AuthProvider>
  );
}

export default App;
