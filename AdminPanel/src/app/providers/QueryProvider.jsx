import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

function getErrorMessage(error) {
  const message = error?.message || "Something went wrong. Please try again.";
  if (message === "Route not found") {
    return "Service is not available right now. Please try again.";
  }
  return message;
}

export default function QueryProvider({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.disableGlobalErrorToast) return;
            toast.error(getErrorMessage(error), {
              id: `query-${query.queryHash}`,
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.options.meta?.disableGlobalErrorToast) return;
            toast.error(getErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
