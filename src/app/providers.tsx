'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/providers/auth-provider';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

