import { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuthSession,
  fetchAuthMe,
  loginAdmin,
  logoutAdmin,
} from "../services/api";

const AuthContext = createContext();

const BUSINESS_TYPES = {
  RESTRO: "restro",
  HOTEL: "hotel",
};

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("adminAuth") === "true",
  );
  const [role, setRole] = useState(
    () => sessionStorage.getItem("adminAuthRole") || "cashier",
  );
  const [businessType, setBusinessType] = useState(
    () => sessionStorage.getItem("adminBusinessType") || BUSINESS_TYPES.RESTRO,
  );
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState(
    () => sessionStorage.getItem("adminBusinessName") || "",
  );
  const [userName, setUserName] = useState(
    () => sessionStorage.getItem("adminUserName") || "",
  );
  const [subdomain, setSubdomain] = useState(
    () => sessionStorage.getItem("adminSubdomain") || "",
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        if (sessionStorage.getItem("adminAuth") !== "true") {
          if (mounted) setLoading(false);
          return;
        }

        const me = await fetchAuthMe();
        if (!mounted) return;

        setIsAuthenticated(true);
        setRole(me.role || "cashier");
        setBusinessType(me.businessType || BUSINESS_TYPES.RESTRO);
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminAuthRole", me.role || "cashier");
        sessionStorage.setItem(
          "adminBusinessType",
          me.businessType || BUSINESS_TYPES.RESTRO,
        );
        if (me.businessName) {
          setBusinessName(me.businessName);
          sessionStorage.setItem("adminBusinessName", me.businessName);
        }
        if (me.name) {
          setUserName(me.name);
          sessionStorage.setItem("adminUserName", me.name);
        }
        const resolvedSubdomain = me.subdomain || toSlug(me.businessName);
        setSubdomain(resolvedSubdomain);
        if (resolvedSubdomain) {
          sessionStorage.setItem("adminSubdomain", resolvedSubdomain);
        }
      } catch {
        clearAuthSession();
        if (!mounted) return;
        setIsAuthenticated(false);
        setRole("cashier");
        setBusinessType(BUSINESS_TYPES.RESTRO);
        setBusinessName("");
        setUserName("");
        setSubdomain("");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-logout when the API detects an expired/revoked token mid-session
  useEffect(() => {
    const handleExpired = () => {
      setIsAuthenticated(false);
      setRole("cashier");
      setBusinessType(BUSINESS_TYPES.RESTRO);
      setBusinessName("");
      setUserName("");
      setSubdomain("");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const login = async (identifier, password, otpToken) => {
    try {
      const data = await loginAdmin(identifier, password, otpToken);
      setIsAuthenticated(true);
      setRole(data.role || "cashier");
      setBusinessType(data.businessType || BUSINESS_TYPES.RESTRO);
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("adminAuthRole", data.role || "cashier");
      sessionStorage.setItem(
        "adminBusinessType",
        data.businessType || BUSINESS_TYPES.RESTRO,
      );
      if (data.businessName) {
        setBusinessName(data.businessName);
        sessionStorage.setItem("adminBusinessName", data.businessName);
      }
      if (data.name) {
        setUserName(data.name);
        sessionStorage.setItem("adminUserName", data.name);
      }
      const resolvedSubdomain = data.subdomain || toSlug(data.businessName);
      setSubdomain(resolvedSubdomain);
      if (resolvedSubdomain) {
        sessionStorage.setItem("adminSubdomain", resolvedSubdomain);
      }
      return { success: true, subdomain: resolvedSubdomain || "" };
    } catch {
      return { success: false, subdomain: "" };
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setRole("cashier");
    setBusinessType(BUSINESS_TYPES.RESTRO);
    setBusinessName("");
    setUserName("");
    setSubdomain("");
    clearAuthSession();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        businessType,
        setBusinessType,
        businessName,
        userName,
        subdomain,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
