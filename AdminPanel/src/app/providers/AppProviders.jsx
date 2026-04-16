import QueryProvider from "./QueryProvider";
import { AuthProvider } from "../../context/AuthContext";

export default function AppProviders({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
