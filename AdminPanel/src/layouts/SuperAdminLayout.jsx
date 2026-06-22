import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  LogOut,
  Menu,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  ListFilter,
  Activity,
  UserCircle,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { superAdminLogout, isSuperAdminLoggedIn } from "../services/superadminApi";

const SIDEBAR_ITEMS = [
  { path: "/superadmin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/superadmin/restaurants", icon: Store, label: "Restaurants" },
  { path: "/superadmin/audit-logs", icon: ListFilter, label: "Audit Logs" },
  { path: "/superadmin/system", icon: Activity, label: "System Health" },
  { path: "/superadmin/profile", icon: UserCircle, label: "Profile" },
];

function SidebarContent({ compactSidebar, handleLogout }) {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Brand */}
      <div
        className={`h-16 flex items-center border-b border-border ${compactSidebar ? "px-3 justify-center" : "px-6"}`}
      >
        <Link
          to="/superadmin/dashboard"
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron to-saffron2 flex items-center justify-center shadow-md shadow-saffron/20 shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          {!compactSidebar && (
            <div>
              <p className="text-sm font-bold text-ink leading-tight">BuzTap</p>
              <p className="text-[10px] font-semibold text-saffron uppercase tracking-wider">
                Super Admin
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/superadmin/restaurants" && location.pathname.startsWith("/superadmin/restaurants"));
          return (
            <Link
              key={item.path}
              to={item.path}
              title={compactSidebar ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 font-medium text-sm transition-colors ${
                isActive
                  ? "bg-saffron-lt text-saffron border-saffron"
                  : "text-muted border-transparent hover:bg-paper hover:text-ink"
              } ${compactSidebar ? "justify-center" : ""}`}
            >
              <item.icon size={18} />
              {!compactSidebar ? item.label : null}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          title={compactSidebar ? "Sign Out" : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer ${compactSidebar ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {!compactSidebar ? "Sign Out" : null}
        </button>
      </div>
    </div>
  );
}

export default function SuperAdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(
    () => localStorage.getItem("saSidebarCompact") === "true",
  );
  const location = useLocation();
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!isSuperAdminLoggedIn()) {
      navigate("/superadmin", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("saSidebarCompact", String(compactSidebar));
  }, [compactSidebar]);

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    superAdminLogout();
    toast.success("Signed out");
    navigate("/superadmin", { replace: true });
  };

  const pageTitle =
    location.pathname.includes("/dashboard")
      ? "Dashboard"
      : location.pathname.includes("/restaurants")
        ? "Restaurants"
        : location.pathname.includes("/profile")
          ? "Profile"
          : location.pathname.includes("/audit-logs")
            ? "Audit Logs"
            : location.pathname.includes("/system")
              ? "System Health"
              : "Super Admin";

  // Get admin profile from localStorage
  const adminProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem("superAdminProfile") || "{}");
    } catch { return {}; }
  })();

  if (!isSuperAdminLoggedIn()) return null;

  return (
    <div className="min-h-screen bg-paper font-[Inter,sans-serif] flex">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed inset-y-0 z-20 transition-all ${compactSidebar ? "w-20" : "w-64"}`}
      >
        <SidebarContent
          compactSidebar={compactSidebar}
          handleLogout={handleLogout}
        />
        <button
          onClick={() => setCompactSidebar((prev) => !prev)}
          className="absolute -right-4 top-6 w-8 h-8 rounded-full border border-border bg-white text-muted hover:text-ink shadow-md flex items-center justify-center cursor-pointer"
          title={compactSidebar ? "Show menu names" : "Hide menu names"}
        >
          {compactSidebar ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-30"
            />
            <Motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-40 bg-white"
            >
              <SidebarContent
                compactSidebar={false}
                handleLogout={handleLogout}
              />
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all ${compactSidebar ? "lg:pl-20" : "lg:pl-64"}`}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted hover:bg-paper rounded-lg cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-ink text-lg sm:text-xl">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffron2 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {(adminProfile?.name || "SA").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-ink leading-tight">
                {adminProfile?.name || "Super Admin"}
              </p>
              <p className="text-xs text-muted">{adminProfile?.email || "Platform"}</p>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-x-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
