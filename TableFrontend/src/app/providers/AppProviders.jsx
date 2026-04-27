import { AuthProvider } from "../../context/AuthContext";
import { RestroAuthProvider } from "../../context/RestroAuthContext";
import { Toaster } from "react-hot-toast";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <RestroAuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: "Inter, sans-serif", fontSize: "14px" },
            success: { iconTheme: { primary: "#e8720c", secondary: "#fff" } },
          }}
        />
      </RestroAuthProvider>
    </AuthProvider>
  );
}
