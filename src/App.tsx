import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './contexts/AuthContext';
import { ClinicProvider, useClinicContext } from './contexts/ClinicContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ErrorFallback } from './components/ui/ErrorFallback';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for code splitting
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Application = lazy(() => import('./pages/Application').then(m => ({ default: m.Application })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Agenda = lazy(() => import('./pages/Agenda').then(m => ({ default: m.Agenda })));
const Patients = lazy(() => import('./pages/Patients').then(m => ({ default: m.Patients })));
const PatientDetails = lazy(() => import('./pages/PatientDetails').then(m => ({ default: m.PatientDetails })));
const Finance = lazy(() => import('./pages/Finance').then(m => ({ default: m.Finance })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const WhatsAppMetrics = lazy(() => import('./pages/WhatsAppMetrics').then(m => ({ default: m.WhatsAppMetrics })));
const NewPatient = lazy(() => import('./pages/NewPatient').then(m => ({ default: m.NewPatient })));
const EditPatient = lazy(() => import('./pages/EditPatient').then(m => ({ default: m.EditPatient })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

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

/**
 * Demo layout - same as AppLayout but without auth requirement.
 * For demonstration purposes only.
 */
function DemoLayout() {
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <ClinicProvider>
          <Toaster richColors position="top-right" />
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Public Application Page (Premium) */}
            <Route path="/apply" element={<Application />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Demo Routes - No auth required */}
            <Route element={<DemoLayout />}>
              <Route path="/demo" element={<Dashboard />} />
              <Route path="/demo/agenda" element={<Agenda />} />
              <Route path="/demo/patients" element={<Patients />} />
              <Route path="/demo/finance" element={<Finance />} />
              <Route path="/demo/reports" element={<Reports />} />
              <Route path="/demo/whatsapp" element={<WhatsAppMetrics />} />
            </Route>

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
              <Route path="/whatsapp" element={<WhatsAppMetrics />} />
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
            <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </Router>
        </ClinicProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
