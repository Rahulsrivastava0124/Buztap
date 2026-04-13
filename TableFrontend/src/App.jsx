import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import DemoMenu from "./pages/DemoMenu";
import ContactUs from "./pages/ContactUs";
import AdminLayout from "./layouts/AdminLayout";
import {
  OverviewTab,
  FinanceTab,
  MenuTab,
  OperationsTab,
} from "./pages/Dashboard";
import PosSystem from "./pages/PosSystem";
import PosCheckout from "./pages/PosCheckout";
import OrdersPage from "./pages/OrdersPage";
import TablesPage from "./pages/TablesPage";
import InventoryPage from "./pages/InventoryPage";
import StaffPage from "./pages/StaffPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/demo" element={<DemoMenu />} />
      <Route path="/contact" element={<ContactUs />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/overview" replace />}
          />
          <Route
            path="/dashboard/overview"
            element={
              <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <OverviewTab />
              </div>
            }
          />
          <Route element={<ProtectedRoute minimumRole="manager" />}>
            <Route
              path="/dashboard/finance"
              element={
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                  <FinanceTab />
                </div>
              }
            />
            <Route
              path="/dashboard/menu"
              element={
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                  <MenuTab />
                </div>
              }
            />
          </Route>
          <Route
            path="/dashboard/operations"
            element={
              <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <OperationsTab />
              </div>
            }
          />
          <Route path="/pos" element={<PosSystem />} />
          <Route path="/pos/checkout" element={<PosCheckout />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route element={<ProtectedRoute minimumRole="manager" />}>
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          <Route element={<ProtectedRoute minimumRole="admin" />}>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
