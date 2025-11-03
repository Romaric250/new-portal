'use client';

import { useSession as useBetterAuthSession } from '@/lib/auth-client';

export const useSession = () => {
  const { data: session, isPending } = useBetterAuthSession();

  return {
    session,
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
  };
};

