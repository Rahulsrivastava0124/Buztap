import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import PosSystem from "./pages/PosSystem";
import PosCheckout from "./pages/PosCheckout";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import StaffPage from "./pages/StaffPage";
import ReportsPage from "./pages/ReportsPage";
import OffersPage from "./pages/OffersPage";
import SettingsPage from "./pages/SettingsPage";
import MenuPage from "./pages/MenuPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Admin Routes — all scoped under /:slug */}
      <Route element={<ProtectedRoute />}>
        <Route path="/:slug" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard/overview" replace />} />
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
  );
}
