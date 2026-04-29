import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loginRestro, registerRestro } from "../services/api";

const RestroAuthContext = createContext(null);

const TOKEN_KEY = "restroToken";
const USER_KEY = "restroUser";

export function RestroAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token && user);

  const _persist = useCallback((tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const register = useCallback(
    async (formData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await registerRestro(formData);
        _persist(res.token, {
          name: res.name,
          businessName: res.businessName,
          businessType: res.businessType,
          businessId: res.businessId,
          role: res.role,
        });
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [_persist],
  );

  const login = useCallback(
    async (identifier, password, otpToken) => {
      setLoading(true);
      setError(null);
      try {
        const res = await loginRestro(identifier, password, otpToken);
        _persist(res.token, {
          name: res.name,
          businessName: res.businessName,
          businessType: res.businessType,
          role: res.role,
        });
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [_persist],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === TOKEN_KEY && !e.newValue) {
        setToken(null);
        setUser(null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <RestroAuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </RestroAuthContext.Provider>
  );
}

export function useRestroAuth() {
  const ctx = useContext(RestroAuthContext);
  if (!ctx)
    throw new Error("useRestroAuth must be used inside RestroAuthProvider");
  return ctx;
}
