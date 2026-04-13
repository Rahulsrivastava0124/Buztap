import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Settings,
  Utensils,
  LogOut,
  Menu,
  Bell,
  Banknote,
  UtensilsCrossed,
  Smartphone,
  ClipboardList,
  Armchair,
  Boxes,
  Users2,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { hasRoleAccess } from "../utils/access";

const SIDEBAR_ITEMS = [
  {
    path: "/dashboard/overview",
    icon: LayoutDashboard,
    label: "Overview",
    minimumRole: "cashier",
  },
  {
    path: "/dashboard/finance",
    icon: Banknote,
    label: "Sales & Finance",
    minimumRole: "manager",
  },
  {
    path: "/dashboard/menu",
    icon: UtensilsCrossed,
    label: "Menu & Products",
    minimumRole: "manager",
  },
  {
    path: "/dashboard/operations",
    icon: Smartphone,
    label: "Operations & Tables",
    minimumRole: "cashier",
  },
  {
    path: "/pos",
    icon: MonitorSmartphone,
    label: "Point of Sale",
    minimumRole: "cashier",
  },
  {
    path: "/orders",
    icon: ClipboardList,
    label: "Orders",
    minimumRole: "cashier",
  },
  { path: "/tables", icon: Armchair, label: "Tables", minimumRole: "cashier" },
  { path: "/inventory", icon: Boxes, label: "Inventory", minimumRole: "admin" },
  { path: "/staff", icon: Users2, label: "Staff", minimumRole: "manager" },
  {
    path: "/reports",
    icon: FileBarChart2,
    label: "Reports",
    minimumRole: "manager",
  },
  {
    path: "/settings",
    icon: Settings,
    label: "Settings",
    minimumRole: "admin",
  },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(
    () => localStorage.getItem("sidebarCompact") === "true",
  );
  const location = useLocation();
  const { logout, role, businessType } = useAuth();
  const navigate = useNavigate();
  const visibleSidebarItems = SIDEBAR_ITEMS.filter((item) =>
    hasRoleAccess(role, item.minimumRole),
  );
  const isHotelMode = businessType === "hotel";

  useEffect(() => {
    localStorage.setItem("sidebarCompact", String(compactSidebar));
  }, [compactSidebar]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Brand */}
      <div
        className={`h-16 flex items-center border-b border-border ${compactSidebar ? "px-3 justify-center" : "px-6"}`}
      >
        <Link
          to="/dashboard"
          className={`flex items-center ${compactSidebar ? "justify-center" : "gap-2.5"}`}
        >
          <span className="w-8 h-8 bg-saffron rounded-lg flex items-center justify-center">
            <Utensils size={16} className="text-white" strokeWidth={2.2} />
          </span>
          {!compactSidebar ? (
            <span className="font-display font-bold text-ink text-xl tracking-tight">
              restroMenu
            </span>
          ) : null}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {visibleSidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const dynamicLabel =
            item.path === "/tables"
              ? isHotelMode
                ? "Rooms"
                : "Tables"
              : item.path === "/dashboard/operations"
                ? isHotelMode
                  ? "Operations & Rooms"
                  : "Operations & Tables"
                : item.label;
          return (
            <Link
              key={`${item.path}-${dynamicLabel}`}
              to={item.path}
              title={compactSidebar ? dynamicLabel : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? "bg-saffron-lt text-saffron"
                  : "text-muted hover:bg-paper hover:text-ink"
              } ${compactSidebar ? "justify-center" : ""}`}
            >
              <item.icon size={18} />
              {!compactSidebar ? dynamicLabel : null}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          title={compactSidebar ? "Sign Out" : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:bg-red-50 hover:text-red-600 transition-colors ${compactSidebar ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {!compactSidebar ? "Sign Out" : null}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper font-[Inter,sans-serif] flex">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed inset-y-0 z-20 transition-all ${compactSidebar ? "w-20" : "w-64"}`}
      >
        <SidebarContent />
        <button
          onClick={() => setCompactSidebar((prev) => !prev)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-border bg-white text-muted hover:text-ink shadow-sm flex items-center justify-center"
          title={compactSidebar ? "Show menu names" : "Hide menu names"}
          aria-label={compactSidebar ? "Show menu names" : "Hide menu names"}
        >
          {compactSidebar ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
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
              <SidebarContent />
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all ${compactSidebar ? "lg:pl-20" : "lg:pl-64"}`}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted hover:bg-paper rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-ink text-lg sm:text-xl">
              {location.pathname.includes("/overview") && "Executive Overview"}
              {location.pathname.includes("/finance") && "Sales & Finance"}
              {location.pathname.includes("/menu") && "Menu & Products"}
              {location.pathname.includes("/operations") &&
                (isHotelMode ? "Operations & Rooms" : "Operations & Tables")}
              {location.pathname.startsWith("/pos") &&
                (location.pathname === "/pos/checkout"
                  ? "POS Checkout"
                  : "Point of Sale")}
              {location.pathname === "/orders" && "Orders"}
              {location.pathname === "/tables" &&
                (isHotelMode ? "Rooms" : "Tables")}
              {location.pathname === "/inventory" && "Inventory"}
              {location.pathname === "/staff" && "Staff"}
              {location.pathname === "/reports" && "Reports"}
              {location.pathname === "/settings" && "Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted hover:bg-paper rounded-full transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-saffron rounded-full border border-white" />
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#fbdabf] border border-saffron-lt flex items-center justify-center">
                <span className="text-xs font-bold text-saffron">SG</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-ink leading-tight">
                  Spice Garden
                </p>
                <p className="text-xs text-muted">
                  {businessType === "hotel" ? "Hotel Mode" : "Restaurant Mode"}
                </p>
              </div>
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
