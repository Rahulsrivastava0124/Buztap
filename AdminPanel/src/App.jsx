import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import PosSystem from "./pages/PosSystem";
import PosCheckout from "./pages/PosCheckout";
import OrdersPage from "./pages/OrdersPage";
import TablesPage from "./pages/TablesPage";
import InventoryPage from "./pages/InventoryPage";
import StaffPage from "./pages/StaffPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import MenuPage from "./pages/MenuPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Admin Routes — all scoped under /:slug */}
      <Route element={<ProtectedRoute />}>
        <Route path="/:slug" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard/overview" replace />} />
          <Route path="dashboard/*" element={<Dashboard />} />
          <Route path="pos" element={<PosSystem />} />
          <Route path="pos/checkout" element={<PosCheckout />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route element={<ProtectedRoute minimumRole="manager" />}>
            <Route path="menu" element={<MenuPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="reports" element={<ReportsPage />} />
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
