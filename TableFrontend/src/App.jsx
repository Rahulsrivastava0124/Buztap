import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DemoMenu = lazy(() => import("./pages/DemoMenu"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const RestaurantSearch = lazy(() => import("./pages/RestaurantSearch"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-500">
      Loading...
    </div>
  );
}

function LegacyGuestRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/order${search || ""}`} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        {/* Primary guest ordering route */}
        <Route path="/order" element={<DemoMenu />} />
        {/* Backward-compat aliases so old QR codes & links still work */}
        <Route path="/menu" element={<LegacyGuestRedirect />} />
        <Route path="/demo" element={<LegacyGuestRedirect />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/search" element={<RestaurantSearch />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </Suspense>
  );
}
