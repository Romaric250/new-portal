'use client';

import { ReactNode } from 'react';
import { AuthProvider as BetterAuthProvider } from '@/lib/auth-client';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return <BetterAuthProvider>{children}</BetterAuthProvider>;
};

