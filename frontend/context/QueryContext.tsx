"use client";

import { createContext, useContext, useState } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

interface QueryContextType {
  refetch: () => Promise<unknown>;
  isLoading: boolean;
  error: unknown;
}

// Create a Context
const QueryContext = createContext<QueryContextType | undefined>(undefined);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // This component assumes it's wrapped in a QueryClientProvider
  const { refetch, isLoading, error } = useQuery({
    queryKey: ["initialQuery"],
    queryFn: () => Promise.resolve(null),
    enabled: false, // Don't run this query automatically
  });

  const contextValue: QueryContextType = {
    refetch,
    isLoading,
    error,
  };

  return (
    <QueryContext.Provider value={contextValue}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQueryContext = (): QueryContextType => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQueryContext must be used within a QueryProvider");
  }
  return context;
};

export default QueryContext;
