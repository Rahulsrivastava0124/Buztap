import { createContext, useContext } from "react";

// AuthContext is kept as a thin stub — the guest-facing app uses
// RestroAuthContext for actual session state. This file only exists so any
// legacy import of AuthProvider / useAuth does not crash.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
