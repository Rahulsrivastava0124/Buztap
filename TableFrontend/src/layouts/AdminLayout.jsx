import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  MenuSquare, 
  Settings, 
  Utensils, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Banknote,
  UtensilsCrossed,
  Smartphone
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const SIDEBAR_ITEMS = [
  { path: "/dashboard/overview", icon: LayoutDashboard, label: "Overview" },
  { path: "/dashboard/finance", icon: Banknote, label: "Sales & Finance" },
  { path: "/dashboard/menu", icon: UtensilsCrossed, label: "Menu & Products" },
  { path: "/dashboard/operations", icon: Smartphone, label: "Operations & Tables" },
  { path: "/pos", icon: MonitorSmartphone, label: "Point of Sale" },
  { path: "#", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#e0d9ce]">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#e0d9ce]">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="w-8 h-8 bg-[#e8720c] rounded-lg flex items-center justify-center">
            <Utensils size={16} className="text-white" strokeWidth={2.2} />
          </span>
          <span className="font-display font-bold text-[#0f0e0b] text-xl tracking-tight">
            restroMenu
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                isActive
                  ? "bg-[#fef0e4] text-[#e8720c]"
                  : "text-[#857c6e] hover:bg-[#faf7f2] hover:text-[#0f0e0b]"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-[#e0d9ce]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#857c6e] hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] font-[Inter,sans-serif] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 fixed inset-y-0 z-20">
        <SidebarContent />
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
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#e0d9ce] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#857c6e] hover:bg-[#faf7f2] rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-[#0f0e0b] text-lg">
              {location.pathname.includes("/overview") && "Executive Overview"}
              {location.pathname.includes("/finance") && "Sales & Finance"}
              {location.pathname.includes("/menu") && "Menu & Products"}
              {location.pathname.includes("/operations") && "Operations & Tables"}
              {location.pathname === "/pos" && "Point of Sale"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#857c6e] hover:bg-[#faf7f2] rounded-full transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e8720c] rounded-full border border-white" />
            </button>
            <div className="h-8 w-px bg-[#e0d9ce]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#fbdabf] border border-[#fef0e4] flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#e8720c]">SG</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold text-[#0f0e0b] leading-tight">Spice Garden</p>
                <p className="text-[10px] text-[#857c6e]">Pune Branch</p>
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
