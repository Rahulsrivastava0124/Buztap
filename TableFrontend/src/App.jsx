import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import DemoMenu from "./pages/DemoMenu";
import AdminLayout from "./layouts/AdminLayout";
import { OverviewTab, FinanceTab, MenuTab, OperationsTab } from "./pages/Dashboard";
import PosSystem from "./pages/PosSystem";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/demo" element={<DemoMenu />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/dashboard/overview" element={<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><OverviewTab /></div>} />
            <Route path="/dashboard/finance" element={<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><FinanceTab /></div>} />
            <Route path="/dashboard/menu" element={<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><MenuTab /></div>} />
            <Route path="/dashboard/operations" element={<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><OperationsTab /></div>} />
            <Route path="/pos" element={<PosSystem />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
