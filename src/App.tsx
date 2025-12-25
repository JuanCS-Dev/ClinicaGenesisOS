import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './contexts/AuthContext';
import { ClinicProvider, useClinicContext } from './contexts/ClinicContext';
import { ConsentProvider } from './contexts/ConsentContext';
import { PatientAuthProvider } from './contexts/PatientAuthContext';
import { PageProvider } from './contexts/PageContext';
import { ThemeProvider, SkipLink } from './design-system';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ErrorFallback } from './components/ui/ErrorFallback';
import { Loader2 } from 'lucide-react';
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from './components/pwa';
import { ConsentBanner } from './components/consent';

// Lazy-loaded pages for code splitting
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Application = lazy(() => import('./pages/Application').then(m => ({ default: m.Application })));

// Landing subpages
const Manifesto = lazy(() => import('./pages/landing/Manifesto').then(m => ({ default: m.Manifesto })));
const Tecnologia = lazy(() => import('./pages/landing/Tecnologia').then(m => ({ default: m.Tecnologia })));
const Membership = lazy(() => import('./pages/landing/Membership').then(m => ({ default: m.Membership })));
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
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Billing = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })));
const Help = lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Public pages (no auth required)
const BookAppointment = lazy(() => import('./pages/public/BookAppointment'));
const ClinicProfile = lazy(() => import('./pages/public/ClinicProfile'));

// Patient Portal pages
const PatientLogin = lazy(() => import('./pages/patient-portal/Login'));
const CompleteSignIn = lazy(() => import('./pages/patient-portal/CompleteSignIn'));
const PatientDashboard = lazy(() => import('./pages/patient-portal/Dashboard'));
const PatientAppointments = lazy(() => import('./pages/patient-portal/Appointments'));
const PatientHistory = lazy(() => import('./pages/patient-portal/History'));
const PatientLabResults = lazy(() => import('./pages/patient-portal/LabResults'));
const PatientPrescriptions = lazy(() => import('./pages/patient-portal/Prescriptions'));
const PatientMessages = lazy(() => import('./pages/patient-portal/Messages'));
const PatientBilling = lazy(() => import('./pages/patient-portal/Billing'));
const PatientTelehealth = lazy(() => import('./pages/patient-portal/Telehealth'));

// Patient Portal Layout
const PatientPortalLayout = lazy(() => import('./components/patient-portal/PatientPortalLayout'));

// Patient Portal Demo
const DemoEntry = lazy(() => import('./pages/patient-portal/DemoEntry'));

/**
 * Loading spinner component for async operations.
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-genesis-soft">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-genesis-primary animate-spin" />
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
 * Wrapped with PageProvider for contextual header support.
 */
function AppLayout() {
  return (
    <PageProvider>
      <div className="min-h-screen bg-[var(--color-genesis-soft)] flex font-sans text-[var(--color-genesis-text)] selection:bg-[var(--color-genesis-primary)]/20 selection:text-[var(--color-genesis-primary)]">
        <SkipLink />
        <InstallPrompt />
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-w-0 transition-all duration-300">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 p-8 overflow-y-auto custom-scrollbar focus:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
    </PageProvider>
  );
}

/**
 * Demo layout - same as AppLayout but without auth requirement.
 * For demonstration purposes only.
 */
function DemoLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-genesis-soft)] flex font-sans text-[var(--color-genesis-text)] selection:bg-[var(--color-genesis-primary)]/20 selection:text-[var(--color-genesis-primary)]">
      <SkipLink />
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 p-8 overflow-y-auto custom-scrollbar focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <AuthProvider>
          <ClinicProvider>
            <ConsentProvider>
              <PatientAuthProvider>
              <Toaster richColors position="top-right" />
              <OfflineIndicator />
              <UpdatePrompt />
              <ConsentBanner />
              <Router>
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Public Application Page (Premium) */}
            <Route path="/apply" element={<Application />} />

            {/* Landing Subpages */}
            <Route path="/manifesto" element={<Manifesto />} />
            <Route path="/tecnologia" element={<Tecnologia />} />
            <Route path="/membership" element={<Membership />} />

            {/* Public Booking Pages (no auth required) */}
            <Route path="/agendar/:clinicSlug" element={<BookAppointment />} />
            <Route path="/clinica/:clinicSlug" element={<ClinicProfile />} />

            {/* Patient Portal Routes */}
            <Route path="/portal/login" element={<PatientLogin />} />
            <Route path="/portal/complete-signin" element={<CompleteSignIn />} />
            <Route element={<PatientPortalLayout />}>
              <Route path="/portal" element={<PatientDashboard />} />
              <Route path="/portal/consultas" element={<PatientAppointments />} />
              <Route path="/portal/historico" element={<PatientHistory />} />
              <Route path="/portal/exames" element={<PatientLabResults />} />
              <Route path="/portal/receitas" element={<PatientPrescriptions />} />
              <Route path="/portal/mensagens" element={<PatientMessages />} />
              <Route path="/portal/financeiro" element={<PatientBilling />} />
              <Route path="/portal/teleconsulta" element={<PatientTelehealth />} />
            </Route>

            {/* Patient Portal Demo Routes - No auth required */}
            <Route element={<DemoEntry />}>
              <Route path="/portal/demo" element={<PatientDashboard />} />
              <Route path="/portal/demo/consultas" element={<PatientAppointments />} />
              <Route path="/portal/demo/historico" element={<PatientHistory />} />
              <Route path="/portal/demo/exames" element={<PatientLabResults />} />
              <Route path="/portal/demo/receitas" element={<PatientPrescriptions />} />
              <Route path="/portal/demo/mensagens" element={<PatientMessages />} />
              <Route path="/portal/demo/financeiro" element={<PatientBilling />} />
              <Route path="/portal/demo/teleconsulta" element={<PatientTelehealth />} />
            </Route>

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
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/whatsapp" element={<WhatsAppMetrics />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              </Router>
              </PatientAuthProvider>
            </ConsentProvider>
          </ClinicProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
