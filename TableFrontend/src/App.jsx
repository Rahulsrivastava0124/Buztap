import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import DemoMenu from "./pages/DemoMenu";
import OrderHistory from "./pages/OrderHistory";
import RestaurantSearch from "./pages/RestaurantSearch";
import ContactUs from "./pages/ContactUs";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      {/* Primary guest ordering route */}
      <Route path="/order" element={<DemoMenu />} />
      {/* Backward-compat aliases so old QR codes & links still work */}
      <Route
        path="/menu"
        element={<Navigate to={`/order${window.location.search}`} replace />}
      />
      <Route
        path="/demo"
        element={<Navigate to={`/order${window.location.search}`} replace />}
      />
      <Route path="/history" element={<OrderHistory />} />
      <Route path="/search" element={<RestaurantSearch />} />
      <Route path="/contact" element={<ContactUs />} />
    </Routes>
  );
}
