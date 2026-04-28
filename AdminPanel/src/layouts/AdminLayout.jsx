import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
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
  TicketPercent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { hasRoleAccess } from "../utils/access";
import {
  fetchIncomingQrOrders,
  approveQrOrder,
  declineQrOrder,
  fetchBusinessProfile,
} from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const SIDEBAR_ITEMS = [
  {
    path: "/dashboard/overview",
    icon: LayoutDashboard,
    label: "Dashboard",
    minimumRole: "cashier",
  },
  {
    path: "/dashboard/finance",
    icon: Banknote,
    label: "Sales & Finance",
    minimumRole: "manager",
  },
  {
    path: "/menu",
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
    path: "/offers",
    icon: TicketPercent,
    label: "Coupons & Offers",
    minimumRole: "manager",
  },
  {
    path: "/settings",
    icon: Settings,
    label: "Settings",
    minimumRole: "admin",
  },
];

function SidebarContent({
  slug,
  compactSidebar,
  visibleSidebarItems,
  isHotelMode,
  handleLogout,
  brandName,
  logoImage,
}) {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Brand */}
      <div
        className={`h-16 flex items-center border-b border-border ${compactSidebar ? "px-3 justify-center" : "px-6"}`}
      >
        <Link
          to={`/${slug}/dashboard/overview`}
          className={`flex items-center ${compactSidebar ? "justify-center" : "gap-2.5"}`}
        >
          <span className="w-10 h-10 bg-saffron rounded-lg border border-saffron-lt overflow-hidden flex items-center justify-center shrink-0">
            {logoImage ? (
              <img
                src={logoImage}
                alt={brandName || "Restaurant logo"}
                className="w-full h-full object-cover"
              />
            ) : (
              <Utensils size={18} className="text-white" strokeWidth={2.2} />
            )}
          </span>
          {!compactSidebar ? (
            <span className="font-display font-bold text-ink text-xl tracking-tight">
              {brandName}
            </span>
          ) : null}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {visibleSidebarItems.map((item) => {
          const fullPath = `/${slug}${item.path}`;
          const isActive = location.pathname.startsWith(fullPath);
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
              key={`${fullPath}-${dynamicLabel}`}
              to={fullPath}
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
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(
    () => localStorage.getItem("sidebarCompact") === "true",
  );
  const location = useLocation();
  const { slug } = useParams();
  const { logout, role, businessType, businessName } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [incomingQrOrders, setIncomingQrOrders] = useState([]);
  const [loadingIncomingOrders, setLoadingIncomingOrders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const notifiedOrderIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);
  const notificationRef = useRef(null);
  const visibleSidebarItems = SIDEBAR_ITEMS.filter((item) =>
    hasRoleAccess(role, item.minimumRole),
  );
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
  });

  const brandName = businessProfile?.name || businessName || "BuzTap";
  const brandLogo = businessProfile?.logoImage || "";

  const isHotelMode = businessType === "hotel";
  const canViewIncomingOrders = hasRoleAccess(role, "cashier");
  const unreadIncomingCount = incomingQrOrders.length;
  const formattedIncomingOrders = useMemo(
    () =>
      incomingQrOrders.map((order) => ({
        ...order,
        amountLabel: `Rs ${Number(order.amount || 0).toLocaleString("en-IN")}`,
      })),
    [incomingQrOrders],
  );

  useEffect(() => {
    localStorage.setItem("sidebarCompact", String(compactSidebar));
  }, [compactSidebar]);

  const handleApprove = useCallback(
    async (order, toastId) => {
      if (approvingId) return;
      setApprovingId(order._id);
      try {
        await approveQrOrder(order._id);
        setIncomingQrOrders((prev) => prev.filter((o) => o._id !== order._id));
        notifiedOrderIdsRef.current.delete(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        if (toastId) toast.dismiss(toastId);
        toast.success(`Order ${order.id} accepted — sent to kitchen`);
      } catch {
        toast.error("Failed to approve order");
      } finally {
        setApprovingId(null);
      }
    },
    [approvingId, queryClient],
  );

  const handleDecline = useCallback(
    async (order, toastId) => {
      if (approvingId) return;
      setApprovingId(order._id);
      try {
        await declineQrOrder(order._id);
        setIncomingQrOrders((prev) => prev.filter((o) => o._id !== order._id));
        notifiedOrderIdsRef.current.delete(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        if (toastId) toast.dismiss(toastId);
        toast.error(`Order ${order.id} declined`);
      } catch {
        toast.error("Failed to decline order");
      } finally {
        setApprovingId(null);
      }
    },
    [approvingId, queryClient],
  );

  useEffect(() => {
    if (!canViewIncomingOrders) return;

    let isMounted = true;

    const loadIncomingQrOrders = async () => {
      try {
        if (isMounted) setLoadingIncomingOrders(true);
        const orders = await fetchIncomingQrOrders();
        if (!isMounted) return;

        setIncomingQrOrders(orders || []);

        const newOrders = (orders || []).filter(
          (order) => !notifiedOrderIdsRef.current.has(order.id),
        );

        // Auto-open bell panel when new orders arrive (after first load)
        if (!firstLoadRef.current && newOrders.length > 0) {
          setShowNotifications(true);
        }

        newOrders.forEach((order) => notifiedOrderIdsRef.current.add(order.id));
        firstLoadRef.current = false;
      } catch {
        if (!isMounted) return;
      } finally {
        if (isMounted) setLoadingIncomingOrders(false);
      }
    };

    loadIncomingQrOrders();
    const poller = setInterval(loadIncomingQrOrders, 15000);

    return () => {
      isMounted = false;
      clearInterval(poller);
    };
  }, [canViewIncomingOrders]);

  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-paper font-[Inter,sans-serif] flex">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed inset-y-0 z-20 transition-all ${compactSidebar ? "w-20" : "w-64"}`}
      >
        <SidebarContent
          slug={slug}
          compactSidebar={compactSidebar}
          visibleSidebarItems={visibleSidebarItems}
          isHotelMode={isHotelMode}
          handleLogout={handleLogout}
          brandName={brandName}
          logoImage={brandLogo}
        />
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
              <SidebarContent
                slug={slug}
                compactSidebar={compactSidebar}
                visibleSidebarItems={visibleSidebarItems}
                isHotelMode={isHotelMode}
                handleLogout={handleLogout}
                brandName={brandName}
                logoImage={brandLogo}
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
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted hover:bg-paper rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-ink text-lg sm:text-xl">
              {location.pathname.includes("/overview") && "Dashboard"}
              {location.pathname.includes("/finance") && "Sales & Finance"}
              {location.pathname.includes("/menu") && "Menu & Products"}
              {location.pathname.includes("/operations") &&
                (isHotelMode ? "Operations & Rooms" : "Operations & Tables")}
              {location.pathname.includes("/pos/checkout") && "POS Checkout"}
              {location.pathname.includes("/pos") &&
                !location.pathname.includes("/checkout") &&
                "Point of Sale"}
              {location.pathname.includes("/orders") &&
                !location.pathname.includes("/pos") &&
                "Orders"}
              {location.pathname.includes("/tables") &&
                (isHotelMode ? "Rooms" : "Tables")}
              {location.pathname.includes("/inventory") && "Inventory"}
              {location.pathname.includes("/staff") && "Staff"}
              {location.pathname.includes("/reports") && "Reports"}
              {location.pathname.includes("/offers") && "Coupons & Offers"}
              {location.pathname.includes("/settings") && "Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 text-muted hover:bg-paper rounded-full transition-colors"
                title="Incoming QR orders"
              >
                <Bell size={18} />
                {canViewIncomingOrders && unreadIncomingCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-saffron rounded-full border border-white flex items-center justify-center">
                    {unreadIncomingCount > 9 ? "9+" : unreadIncomingCount}
                  </span>
                ) : null}
              </button>

              {showNotifications ? (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-[0_16px_38px_rgba(15,14,11,0.14)] z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">
                      Incoming Orders
                    </p>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(`/${slug}/orders`);
                      }}
                      className="text-xs text-saffron font-semibold hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {loadingIncomingOrders ? (
                      <p className="px-4 py-3 text-xs text-muted">
                        Checking for incoming QR orders...
                      </p>
                    ) : formattedIncomingOrders.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-muted">
                        No incoming QR orders right now.
                      </p>
                    ) : (
                      formattedIncomingOrders.map((order) => (
                        <div
                          key={order.id}
                          className="px-4 py-3 border-b border-border/70 last:border-b-0"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-semibold text-ink">
                                {order.id}
                              </p>
                              <p className="text-xs text-muted mt-0.5">
                                {order.source}
                              </p>
                              <p className="text-xs font-semibold text-saffron mt-1">
                                {order.amountLabel}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(order, null)}
                              disabled={approvingId === order._id}
                              className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {approvingId === order._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleDecline(order, null)}
                              disabled={approvingId === order._id}
                              className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {approvingId === order._id ? "..." : "Decline"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#fbdabf] border border-saffron-lt flex items-center justify-center">
                <span className="text-xs font-bold text-saffron">
                  {businessName
                    ? businessName
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                    : "?"}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-ink leading-tight">
                  {businessName || "—"}
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
