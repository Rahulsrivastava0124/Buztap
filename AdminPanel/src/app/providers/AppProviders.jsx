import QueryProvider from "./QueryProvider";
import { AuthProvider } from "../../context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function AppProviders({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          gutter={10}
          containerStyle={{
            top: 18,
          }}
          toastOptions={{
            duration: 3200,
            style: {
              borderRadius: "999px",
              padding: "10px 16px",
              minHeight: "unset",
              background: "#0f0e0b",
              color: "#fff",
              border: "1px solid #2a2720",
              boxShadow: "0 12px 30px rgba(15,14,11,0.16)",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: 1.2,
            },
            success: {
              iconTheme: {
                primary: "#3a6348",
                secondary: "#e8f2eb",
              },
              style: {
                borderRadius: "999px",
                background: "#f7fbf8",
                color: "#244531",
                border: "1px solid #d2e7d8",
              },
            },
            error: {
              iconTheme: {
                primary: "#c2410c",
                secondary: "#fff7ed",
              },
              style: {
                borderRadius: "999px",
                background: "#fff7ed",
                color: "#9a3412",
                border: "1px solid #fed7aa",
              },
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
