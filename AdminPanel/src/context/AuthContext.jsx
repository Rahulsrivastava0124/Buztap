import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const BUSINESS_TYPES = {
  RESTRO: "restro",
  HOTEL: "hotel",
};

const ROLE_CREDENTIALS = [
  {
    role: "admin",
    username:
      import.meta.env.VITE_ADMIN_USERNAME ?? import.meta.env.VITE_APP_USERNAME,
    password:
      import.meta.env.VITE_ADMIN_PASSWORD ?? import.meta.env.VITE_APP_PASSWORD,
  },
  {
    role: "manager",
    username: import.meta.env.VITE_MANAGER_USERNAME,
    password: import.meta.env.VITE_MANAGER_PASSWORD,
  },
  {
    role: "cashier",
    username: import.meta.env.VITE_CASHIER_USERNAME,
    password: import.meta.env.VITE_CASHIER_PASSWORD,
  },
].filter((entry) => entry.username && entry.password);

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
  const loading = false;

  const login = (username, password) => {
    const matched = ROLE_CREDENTIALS.find(
      (entry) => entry.username === username && entry.password === password,
    );
    const detectedBusinessType = username.toLowerCase().includes("hotel")
      ? BUSINESS_TYPES.HOTEL
      : BUSINESS_TYPES.RESTRO;

    if (matched) {
      setIsAuthenticated(true);
      setRole(matched.role || "admin");
      setBusinessType(detectedBusinessType);
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("adminAuthRole", matched.role || "admin");
      sessionStorage.setItem("adminBusinessType", detectedBusinessType);
      return true;
    }

    const genericUser = import.meta.env.VITE_APP_USERNAME;
    const genericPass = import.meta.env.VITE_APP_PASSWORD;
    if (username === genericUser && password === genericPass) {
      setIsAuthenticated(true);
      setRole("admin");
      setBusinessType(detectedBusinessType);
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("adminAuthRole", "admin");
      sessionStorage.setItem("adminBusinessType", detectedBusinessType);
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole("cashier");
    setBusinessType(BUSINESS_TYPES.RESTRO);
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminAuthRole");
    sessionStorage.removeItem("adminBusinessType");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        businessType,
        setBusinessType,
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
