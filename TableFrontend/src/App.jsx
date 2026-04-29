import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import lazyWithRetry from "./utils/lazyWithRetry";

const Landing = lazy(() => lazyWithRetry(() => import("./pages/Landing"), "landing"));
const AuthPage = lazy(() => lazyWithRetry(() => import("./pages/AuthPage"), "auth"));
const DemoMenu = lazy(() => lazyWithRetry(() => import("./pages/DemoMenu"), "demo-menu"));
const OrderHistory = lazy(() =>
  lazyWithRetry(() => import("./pages/OrderHistory"), "order-history"),
);
const RestaurantSearch = lazy(() =>
  lazyWithRetry(() => import("./pages/RestaurantSearch"), "restaurant-search"),
);
const ContactUs = lazy(() =>
  lazyWithRetry(() => import("./pages/ContactUs"), "contact-us"),
);

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

function DemoMenuWithBoundary() {
  return (
    <ErrorBoundary>
      <DemoMenu />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        {/* Primary guest ordering route */}
        <Route path="/order" element={<DemoMenuWithBoundary />} />
        {/* Explicit live demo route (always demo-mode menu JSON) */}
        <Route path="/demo" element={<DemoMenuWithBoundary />} />
        {/* Backward-compat aliases so old QR codes & links still work */}
        <Route path="/menu" element={<LegacyGuestRedirect />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/search" element={<RestaurantSearch />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </Suspense>
  );
}
