'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface LoadingContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Create the context with default values
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Create a provider component
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Create a hook to use the Loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
