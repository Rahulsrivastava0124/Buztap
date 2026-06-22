import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { getDefaultAdminPathByRole } from "./utils/access";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PosSystem = lazy(() => import("./pages/PosSystem"));
const PosCheckout = lazy(() => import("./pages/PosCheckout"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const StaffPage = lazy(() => import("./pages/StaffPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const OffersPage = lazy(() => import("./pages/OffersPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const SuperAdminLoginPage = lazy(() => import("./pages/SuperAdminLoginPage"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const SuperAdminRestaurants = lazy(() => import("./pages/SuperAdminRestaurants"));
const SuperAdminAuditLogs = lazy(() => import("./pages/SuperAdminAuditLogs"));
const SuperAdminSystemHealth = lazy(() => import("./pages/SuperAdminSystemHealth"));
const SuperAdminProfile = lazy(() => import("./pages/SuperAdminProfile"));
import SuperAdminLayout from "./layouts/SuperAdminLayout";

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-sm text-muted">
      Loading...
    </div>
  );
}

export default function App() {
  const { role } = useAuth();
  
  // Check if we are on the superadmin subdomain
  const isSuperAdminDomain = window.location.hostname.includes("superadmin");

  if (isSuperAdminDomain) {
    return (
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route path="/" element={<SuperAdminLoginPage />} />
          <Route path="/" element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="restaurants" element={<SuperAdminRestaurants />} />
            <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
            <Route path="system" element={<SuperAdminSystemHealth />} />
            <Route path="profile" element={<SuperAdminProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Super Admin Routes (Fallback for normal domain) */}
        <Route path="/superadmin" element={<SuperAdminLoginPage />} />
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="restaurants" element={<SuperAdminRestaurants />} />
          <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
          <Route path="system" element={<SuperAdminSystemHealth />} />
          <Route path="profile" element={<SuperAdminProfile />} />
        </Route>

        {/* Protected Admin Routes — all scoped under /:slug */}
        <Route element={<ProtectedRoute />}>
          <Route path="/:slug" element={<AdminLayout />}>
            <Route
              index
              element={
                <Navigate to={getDefaultAdminPathByRole(role)} replace />
              }
            />
            <Route path="dashboard/*" element={<Dashboard />} />
            <Route
              path="pos"
              element={
                <ErrorBoundary label="POS">
                  <PosSystem />
                </ErrorBoundary>
              }
            />
            <Route
              path="pos/menu/:tableId"
              element={
                <ErrorBoundary label="POS">
                  <PosSystem />
                </ErrorBoundary>
              }
            />
            <Route
              path="pos/menu/:tableId/checkout"
              element={
                <ErrorBoundary label="POS Checkout">
                  <PosCheckout />
                </ErrorBoundary>
              }
            />
            <Route
              path="pos/checkout"
              element={
                <ErrorBoundary label="POS Checkout">
                  <PosCheckout />
                </ErrorBoundary>
              }
            />
            <Route path="orders" element={<OrdersPage />} />
            <Route element={<ProtectedRoute minimumRole="manager" />}>
              <Route path="menu" element={<MenuPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="offers" element={<OffersPage />} />
            </Route>
            <Route element={<ProtectedRoute minimumRole="admin" />}>
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
