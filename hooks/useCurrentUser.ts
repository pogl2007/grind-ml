'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

export function useCurrentUser() {
  const { data, status } = useNextAuthSession();

  return {
    user: data?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
