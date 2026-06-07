'use client';

import { createContext, useContext, ReactNode } from 'react';

// Placeholder auth context; wire up session state here when backend auth lands.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AuthContextType {
  // Add auth-related state and methods here as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // TODO: Implement authentication logic
  const value: AuthContextType = {};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

