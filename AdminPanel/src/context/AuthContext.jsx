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

const AUTH_EXPIRES_AT_KEY = "adminAuthExpiresAt";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// Keep the session alive for the full life of the JWT (7d) so users stay
// signed in after a passwordless OTP login instead of being logged out daily.
const SESSION_DURATION_MS = 7 * ONE_DAY_MS;

function getStoredValue(key) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function setStoredValue(key, value) {
  localStorage.setItem(key, value);
  sessionStorage.setItem(key, value);
}

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
    () => getStoredValue("adminAuth") === "true",
  );
  const [role, setRole] = useState(
    () => getStoredValue("adminAuthRole") || "cashier",
  );
  const [customRole, setCustomRole] = useState(() => {
    try {
      const stored = getStoredValue("adminCustomRole");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [businessType, setBusinessType] = useState(
    () => getStoredValue("adminBusinessType") || BUSINESS_TYPES.RESTRO,
  );
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState(
    () => getStoredValue("adminBusinessName") || "",
  );
  const [userName, setUserName] = useState(
    () => getStoredValue("adminUserName") || "",
  );
  const [subdomain, setSubdomain] = useState(
    () => getStoredValue("adminSubdomain") || "",
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const expiresAt = Number(getStoredValue(AUTH_EXPIRES_AT_KEY) || 0);
        if (!expiresAt || Date.now() > expiresAt) {
          clearAuthSession();
          if (mounted) setLoading(false);
          return;
        }

        if (getStoredValue("adminAuth") !== "true") {
          if (mounted) setLoading(false);
          return;
        }

        const me = await fetchAuthMe();
        if (!mounted) return;

        setIsAuthenticated(true);
        setRole(me.role || "cashier");
        if (me.customRole) {
          setCustomRole(me.customRole);
          setStoredValue("adminCustomRole", JSON.stringify(me.customRole));
        } else {
          setCustomRole(null);
          setStoredValue("adminCustomRole", "");
        }
        setBusinessType(me.businessType || BUSINESS_TYPES.RESTRO);
        setStoredValue("adminAuth", "true");
        setStoredValue("adminAuthRole", me.role || "cashier");
        setStoredValue(
          "adminBusinessType",
          me.businessType || BUSINESS_TYPES.RESTRO,
        );
        if (me.businessName) {
          setBusinessName(me.businessName);
          setStoredValue("adminBusinessName", me.businessName);
        }
        if (me.name) {
          setUserName(me.name);
          setStoredValue("adminUserName", me.name);
        }
        const resolvedSubdomain = me.subdomain || toSlug(me.businessName);
        setSubdomain(resolvedSubdomain);
        if (resolvedSubdomain) {
          setStoredValue("adminSubdomain", resolvedSubdomain);
        }
      } catch {
        clearAuthSession();
        if (!mounted) return;
        setIsAuthenticated(false);
        setRole("cashier");
        setCustomRole(null);
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
      setCustomRole(null);
      setBusinessType(BUSINESS_TYPES.RESTRO);
      setBusinessName("");
      setUserName("");
      setSubdomain("");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const applyAuthSession = (data) => {
    setIsAuthenticated(true);
    setRole(data.role || "cashier");
    if (data.customRole) {
      setCustomRole(data.customRole);
      setStoredValue("adminCustomRole", JSON.stringify(data.customRole));
    } else {
      setCustomRole(null);
      setStoredValue("adminCustomRole", "");
    }
    setBusinessType(data.businessType || BUSINESS_TYPES.RESTRO);
    setStoredValue("adminAuth", "true");
    setStoredValue("adminAuthRole", data.role || "cashier");
    setStoredValue(
      "adminBusinessType",
      data.businessType || BUSINESS_TYPES.RESTRO,
    );
    if (data.businessName) {
      setBusinessName(data.businessName);
      setStoredValue("adminBusinessName", data.businessName);
    }
    if (data.name) {
      setUserName(data.name);
      setStoredValue("adminUserName", data.name);
    }
    const resolvedSubdomain = data.subdomain || toSlug(data.businessName);
    setSubdomain(resolvedSubdomain);
    if (resolvedSubdomain) {
      setStoredValue("adminSubdomain", resolvedSubdomain);
    }
    return { subdomain: resolvedSubdomain || "", role: data.role || "cashier" };
  };

  const login = async (identifier, otpToken) => {
    try {
      const data = await loginAdmin(identifier, otpToken);

      const session = applyAuthSession(data);
      setStoredValue(
        AUTH_EXPIRES_AT_KEY,
        String(Date.now() + SESSION_DURATION_MS),
      );
      return { success: true, ...session };
    } catch {
      return { success: false, subdomain: "", role: "cashier" };
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setRole("cashier");
    setCustomRole(null);
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
        customRole,
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
