import React, { Component, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { LocationProvider } from './context/LocationContext';
import GovLayout from './layouts/GovLayout';
import PortalLayout from './layouts/PortalLayout';
import AIChatBot from './components/AIChatBot';
import CivicLoader from './components/CivicLoader';
import { useSessionTimeout } from './hooks/useSessionTimeout';

// Public Pages (Lazy Loaded for performance & code-splitting)
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const FindWorker = lazy(() => import('./pages/FindWorker'));
const About = lazy(() => import('./pages/About'));
const Help = lazy(() => import('./pages/Help'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RateCard = lazy(() => import('./pages/RateCard'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));

// Federation & Society Lifecycle Pages (Lazy Loaded)
const SocietyRegistration = lazy(() => import('./pages/SocietyRegistration'));
const SocietyTimeline = lazy(() => import('./pages/SocietyTimeline'));
const FederationPortal = lazy(() => import('./pages/FederationPortal'));
const InstitutionalTenders = lazy(() => import('./pages/InstitutionalTenders'));

// Customer Pages (Lazy Loaded)
const BookService = lazy(() => import('./pages/BookService'));
const CustomerBookings = lazy(() => import('./pages/CustomerBookings'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const SavedAddresses = lazy(() => import('./pages/SavedAddresses'));

// Shared Authenticated Pages (Customer + Worker)
const MyProfile = lazy(() => import('./pages/MyProfile'));

// Worker Pages (Lazy Loaded)
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const WorkerWelfare = lazy(() => import('./pages/WorkerWelfare'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ApexDashboard = lazy(() => import('./pages/ApexDashboard'));
const SocietyDashboard = lazy(() => import('./pages/SocietyDashboard'));

// Protected Route Guard Helper with Strict Single-Role & Admin-Type Isolation
function ProtectedRoute({ children, allowedRoles, allowedAdminTypes }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-20 max-w-xl mx-auto">
        <CivicLoader
          title="Verifying State Cooperative Credentials..."
          subtitle="Connecting to encrypted SSL session node & validating statutory access permissions."
          size="md"
        />
      </div>
    );
  }

  if (!user) {
    const isApexPath = location.pathname.includes('/apex');
    const isSocietyPath = location.pathname.includes('/society') || location.pathname.includes('/federation') || location.pathname.includes('/tenders');
    const isDcoPath = location.pathname.includes('/admin') || location.pathname.includes('/dco');
    const isWorkerPath = location.pathname.includes('/worker');
    const targetRole = (isApexPath || isSocietyPath || isDcoPath) ? 'admin' : isWorkerPath ? 'worker' : 'customer';
    return <Navigate to={`/login?role=${targetRole}`} replace state={{ from: location }} />;
  }

  // Strict Role Isolation: If user's role is not authorized for this route,
  // automatically route them directly to their own dedicated portal!
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'WORKER') {
      return <Navigate to="/worker/dashboard" replace />;
    }
    if (user.role === 'COOPERATIVE_ADMIN') {
      if (user.admin_type === 'DCO_REGISTRAR') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (user.admin_type === 'FEDERATION_HEAD') {
        return <Navigate to="/apex/dashboard" replace />;
      }
      return <Navigate to="/society/dashboard" replace />;
    }
    return <Navigate to="/customer/bookings" replace />;
  }

  // Strict Admin Type Isolation (DCO vs Apex Head vs Society Admin)
  if (allowedAdminTypes && user.role === 'COOPERATIVE_ADMIN') {
    const userAdminType = user.admin_type || 'SOCIETY_ADMIN';
    if (!allowedAdminTypes.includes(userAdminType)) {
      if (userAdminType === 'DCO_REGISTRAR') {
        return <Navigate to="/admin/dashboard" replace state={{ accessDeniedNotice: 'DCO_ONLY' }} />;
      } else if (userAdminType === 'FEDERATION_HEAD') {
        return <Navigate to="/apex/dashboard" replace state={{ accessDeniedNotice: 'APEX_ONLY' }} />;
      } else {
        return <Navigate to="/society/dashboard" replace state={{ accessDeniedNotice: 'SOCIETY_ONLY' }} />;
      }
    }
  }

  return children;
}

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="container py-24 max-w-xl mx-auto flex items-center justify-center">
          <CivicLoader
            title="Loading Portal..."
            subtitle="Accessing secure Cooperative Federation node."
            size="lg"
          />
        </div>
      }
    >
      <Routes>
      {/* ── 1. Public Marketing & Governance Routes (Wrapped in GovLayout) ── */}
      <Route element={<GovLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/find-worker" element={<FindWorker />} />
        <Route path="/book-service" element={<BookService />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Society Statutory Formation Workflow & Timeline (Public) */}
        <Route path="/society/register" element={<SocietyRegistration />} />
        <Route path="/society/timeline" element={<SocietyTimeline />} />
        <Route path="/rate-card" element={<RateCard />} />
      </Route>

      {/* ── 2. Authenticated Dashboard & Portal Routes (Wrapped in PortalLayout) ── */}
      <Route element={<PortalLayout />}>
        {/* Customer Module - Strictly for CUSTOMER only */}
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/addresses"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <SavedAddresses />
            </ProtectedRoute>
          }
        />

        {/* Shared Profile Page (Customer + Worker) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'WORKER']}>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        {/* Worker Module - Strictly for WORKER only */}
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['WORKER']}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/welfare"
          element={
            <ProtectedRoute allowedRoles={['WORKER']}>
              <WorkerWelfare />
            </ProtectedRoute>
          }
        />

        {/* Apex Federation Head Console - Strictly for FEDERATION_HEAD */}
        <Route
          path="/apex/dashboard"
          element={
            <ProtectedRoute allowedRoles={['COOPERATIVE_ADMIN']} allowedAdminTypes={['FEDERATION_HEAD']}>
              <ApexDashboard />
            </ProtectedRoute>
          }
        />

        {/* Primary Society Operations Console - Strictly for SOCIETY_ADMIN */}
        <Route
          path="/society/dashboard"
          element={
            <ProtectedRoute allowedRoles={['COOPERATIVE_ADMIN']} allowedAdminTypes={['SOCIETY_ADMIN']}>
              <SocietyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Backward Compatibility Alias for /federation/portal */}
        <Route
          path="/federation/portal"
          element={
            <ProtectedRoute allowedRoles={['COOPERATIVE_ADMIN']} allowedAdminTypes={['FEDERATION_HEAD', 'SOCIETY_ADMIN']}>
              <FederationPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/federation/tenders"
          element={
            <ProtectedRoute allowedRoles={['COOPERATIVE_ADMIN']} allowedAdminTypes={['FEDERATION_HEAD', 'SOCIETY_ADMIN']}>
              <InstitutionalTenders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutional-tenders"
          element={
            <ProtectedRoute allowedRoles={['COOPERATIVE_ADMIN']} allowedAdminTypes={['FEDERATION_HEAD', 'SOCIETY_ADMIN']}>
              <InstitutionalTenders />
            </ProtectedRoute>
          }
        />

        {/* District Cooperative Officer (DCO) Regulatory Portal - Strictly for DCO_REGISTRAR only */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['COOPERATIVE_ADMIN']} allowedAdminTypes={['DCO_REGISTRAR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dco/dashboard"
          element={<Navigate to="/admin/dashboard?tab=dco_approval" replace />}
        />
        <Route
          path="/dco/portal"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/dco-approvals"
          element={<Navigate to="/admin/dashboard?tab=dco_approval" replace />}
        />
      </Route>

      {/* 404 Fallback in GovLayout */}
      <Route element={<GovLayout />}>
        <Route path="*" element={<PlaceholderPage title="Page Not Found / पृष्ठ नहीं मिला" desc="The requested cooperative service URL does not exist." />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#131B38] border border-[#1E294B] rounded-2xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-950/80 text-red-400 border border-red-800 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Cooperative Platform Recovery Terminal</h2>
            <p className="text-xs text-slate-400">
              An unexpected display exception was caught. Your cooperative account and records remain secure.
            </p>
            {this.state.error && (
              <div className="p-3 bg-black/40 rounded-xl text-[11px] font-mono text-red-300 text-left overflow-auto max-h-32 border border-slate-800">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition cursor-pointer"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SessionSecurityGuard() {
  const { showWarning, secondsRemaining, stayLoggedIn } = useSessionTimeout(30, 25);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center mx-auto text-2xl font-bold">
          ⏳
        </div>
        <h3 className="text-lg font-bold text-white">Session Inactivity Warning</h3>
        <p className="text-xs text-slate-300">
          For statutory data protection and cooperative portal security, your session will automatically log out in:
        </p>
        <div className="text-3xl font-bold font-mono text-white">
          {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, '0')}
        </div>
        <p className="text-[11px] text-slate-400">
          Click below to continue your session and prevent auto-logout.
        </p>
        <button
          onClick={stayLoggedIn}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <AccessibilityProvider>
            <AuthProvider>
              <LocationProvider>
                <SessionSecurityGuard />
                <AppRoutes />
                {/* Global Floating AI Assistant (Persists until window closed) */}
                <AIChatBot />
              </LocationProvider>
            </AuthProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

function PlaceholderPage({ title, step, desc }) {
  return (
    <div className="container py-16 text-center max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs">
        {step && (
          <span className="inline-block px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-3">
            Upcoming: {step}
          </span>
        )}
        <h1 className="text-2xl font-bold text-blue-950 mb-2">{title}</h1>
        <p className="text-sm text-gray-600 mb-6">{desc}</p>
        <div className="flex justify-center gap-3">
          <a href="/" className="btn btn-secondary btn-sm">Home</a>
          <a href="/services" className="btn btn-primary btn-sm">Browse Services</a>
        </div>
      </div>
    </div>
  );
}
