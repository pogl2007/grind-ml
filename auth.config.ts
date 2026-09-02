import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/auth/login',
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        (session.user as { plan?: string }).plan = token.plan as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
