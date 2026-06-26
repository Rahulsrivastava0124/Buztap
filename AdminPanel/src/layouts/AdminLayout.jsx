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
  LogOut,
  Menu,
  Bell,
  Banknote,
  UtensilsCrossed,
  Smartphone,
  ClipboardList,
  Boxes,
  Users2,
  FileBarChart2,
  TicketPercent,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Users,
  Armchair,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { hasRoleAccess, hasPermission, PERMISSIONS } from "../utils/access";
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
    requiredPermission: PERMISSIONS.DASHBOARD_OVERVIEW,
  },
  {
    path: "/dashboard/finance",
    icon: Banknote,
    label: "Sales & Finance",
    minimumRole: "manager",
    requiredPermission: PERMISSIONS.DASHBOARD_FINANCE,
  },
  {
    path: "/menu",
    icon: UtensilsCrossed,
    label: "Menu & Products",
    minimumRole: "manager",
    requiredPermission: PERMISSIONS.MENU_VIEW,
  },
  {
    path: "/dashboard/operations",
    icon: Smartphone,
    label: "Operations",
    minimumRole: "cashier",
    requiredPermission: PERMISSIONS.DASHBOARD_OPERATIONS,
  },
  {
    path: "/pos",
    icon: MonitorSmartphone,
    label: "POS",
    minimumRole: "cashier",
    requiredPermission: PERMISSIONS.POS_ACCESS,
  },
  {
    path: "/orders",
    icon: ClipboardList,
    label: "KOT",
    minimumRole: "cashier",
    requiredPermission: PERMISSIONS.ORDERS_VIEW,
  },
  { 
    path: "/inventory", 
    icon: Boxes, 
    label: "Inventory", 
    minimumRole: "admin",
    requiredPermission: PERMISSIONS.SETTINGS_MANAGE,
  },
  { 
    path: "/staff", 
    icon: Users2, 
    label: "Staff", 
    minimumRole: "manager",
    requiredPermission: PERMISSIONS.STAFF_VIEW,
  },
  {
    path: "/dashboard/visitors",
    icon: Users,
    label: "Visitors",
    minimumRole: "manager",
    requiredPermission: PERMISSIONS.DASHBOARD_VISITORS,
  },
  {
    path: "/reports",
    icon: FileBarChart2,
    label: "Reports",
    minimumRole: "manager",
    requiredPermission: PERMISSIONS.DASHBOARD_FINANCE,
  },
  {
    path: "/offers",
    icon: TicketPercent,
    label: "Coupons & Offers",
    minimumRole: "manager",
    requiredPermission: PERMISSIONS.SETTINGS_MANAGE,
  },
  {
    path: "/tables",
    icon: Armchair,
    label: "Floor Plan",
    minimumRole: "admin",
    requiredPermission: PERMISSIONS.SETTINGS_MANAGE,
  },
  {
    path: "/settings",
    icon: Settings,
    label: "Settings",
    minimumRole: "admin",
    requiredPermission: PERMISSIONS.SETTINGS_MANAGE,
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
          className="flex items-center justify-center"
        >
          <span className="rounded-2xl overflow-hidden">
            <img
              src={logoImage}
              alt={brandName || "BuzTap logo"}
              className={`h-13 w-auto object-contain ${compactSidebar ? "max-w-16" : "max-w-44"}`}
            />
          </span>
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
                ? "Rooms Plan"
                : "Floor Plan"
              : item.path === "/dashboard/operations"
                ? "Operations"
                : item.label;
          return (
            <Link
              key={`${fullPath}-${dynamicLabel}`}
              to={fullPath}
              title={compactSidebar ? dynamicLabel : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 font-medium text-sm transition-colors ${
                isActive
                  ? "bg-saffron-lt text-saffron border-saffron"
                  : "text-muted border-transparent hover:bg-paper hover:text-ink"
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
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer ${compactSidebar ? "justify-center" : ""}`}
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
  const { logout, role, customRole, businessType, businessName, userName } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [incomingQrOrders, setIncomingQrOrders] = useState([]);
  const [loadingIncomingOrders, setLoadingIncomingOrders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const notifiedOrderIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);
  const notificationRef = useRef(null);
  const audioContextRef = useRef(null);
  const hasUserInteractedRef = useRef(false);
  const visibleSidebarItems = SIDEBAR_ITEMS.filter((item) => {
    if (item.requiredPermission) {
      return hasPermission(customRole, role, item.requiredPermission);
    }
    return hasRoleAccess(role, item.minimumRole);
  });
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
  });

  const brandName = businessProfile?.name || businessName || "BuzTap";
  const brandLogo = businessProfile?.logoImage || "/logo.jpeg";

  const isHotelMode = businessType === "hotel";
  const roleLabel = customRole?.name || (role ? role.charAt(0).toUpperCase() + role.slice(1) : "User");
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

  const playIncomingOrderTone = useCallback((newOrderCount = 1) => {
    try {
      if (typeof window === "undefined" || !hasUserInteractedRef.current)
        return;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const beepCount = Math.min(Math.max(newOrderCount, 1), 3);
      for (let i = 0; i < beepCount; i += 1) {
        const startAt = ctx.currentTime + i * 0.2;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(980, startAt);
        oscillator.frequency.exponentialRampToValueAtTime(760, startAt + 0.12);

        gainNode.gain.setValueAtTime(0.0001, startAt);
        gainNode.gain.exponentialRampToValueAtTime(0.11, startAt + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.14);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.15);
      }
    } catch {
      // Silently ignore audio issues to avoid blocking order polling.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCompact", String(compactSidebar));
  }, [compactSidebar]);

  useEffect(() => {
    const markInteraction = () => {
      hasUserInteractedRef.current = true;
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);

    return () => {
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("keydown", markInteraction);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

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
          playIncomingOrderTone(newOrders.length);
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
  }, [canViewIncomingOrders, playIncomingOrderTone]);

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
          className="absolute -right-4 top-6 w-8 h-8 rounded-full border border-border bg-white text-muted hover:text-ink shadow-md flex items-center justify-center cursor-pointer"
          title={compactSidebar ? "Show menu names" : "Hide menu names"}
          aria-label={compactSidebar ? "Show menu names" : "Hide menu names"}
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
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted hover:bg-paper rounded-lg cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-ink text-lg sm:text-xl">
              {location.pathname.includes("/overview") && "Dashboard"}
              {location.pathname.includes("/finance") && "Sales & Finance"}
              {location.pathname.includes("/visitors") && "Visitors"}
              {location.pathname.includes("/menu") && "Menu & Products"}
              {location.pathname.includes("/operations") && "Operations"}
              {location.pathname.includes("/floor-plan") && (isHotelMode ? "Rooms Plan" : "Floor Plan")}
              {location.pathname.includes("/pos/checkout") && "POS Checkout"}
              {location.pathname.includes("/pos") &&
                !location.pathname.includes("/checkout") &&
                "POS"}
              {location.pathname.includes("/orders") &&
                !location.pathname.includes("/pos") &&
                "KOT"}
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
            <div className="relative z-50" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 text-muted hover:bg-paper rounded-full transition-colors cursor-pointer"
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
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-[0_16px_38px_rgba(15,14,11,0.14)] z-60 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">
                      Incoming Orders
                    </p>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(`/${slug}/orders`);
                      }}
                      className="text-xs text-saffron font-semibold hover:underline cursor-pointer"
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
                          className="px-4 py-3 border-b border-border/70 last:border-b-0 cursor-pointer hover:bg-paper/70 transition-colors"
                          onClick={() => {
                            setShowNotifications(false);
                            navigate(
                              `/${slug}/orders?orderId=${encodeURIComponent(order._id)}`,
                            );
                          }}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="text-sm font-semibold text-ink truncate">
                              {order.id}
                              <span className="text-muted font-medium">
                                {" "}
                                · {order.source}
                              </span>
                            </p>
                            <p className="text-sm font-semibold text-saffron shrink-0">
                              {order.amountLabel}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleApprove(order, null);
                              }}
                              disabled={approvingId === order._id}
                              className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5"
                            >
                              {approvingId === order._id ? (
                                "..."
                              ) : (
                                <>
                                  <Check size={14} />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDecline(order, null);
                              }}
                              disabled={approvingId === order._id}
                              className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5"
                            >
                              {approvingId === order._id ? (
                                "..."
                              ) : (
                                <>
                                  <X size={14} />
                                  Decline
                                </>
                              )}
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
                  {userName || businessName
                    ? (userName || businessName)
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
                  {userName || "—"}
                </p>
                <p className="text-xs text-muted">{roleLabel}</p>
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
