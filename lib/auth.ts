import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/auth.config';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Брутфорс-защита: лимитируем и по email (не подберут пароль к одному
        // аккаунту), и по IP (не переберут много email подряд с одного адреса).
        const ip = getClientIp(request);
        const emailOk = checkRateLimit(`login:email:${email.toLowerCase()}`, 5, 10 * 60 * 1000);
        const ipOk = checkRateLimit(`login:ip:${ip}`, 20, 10 * 60 * 1000);
        if (!emailOk || !ipOk) {
          console.warn(`[auth] заблокирован по rate-limit: email=${email} ip=${ip}`);
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.plan = (user as { plan: string }).plan;
        token.isAdmin = (user as { isAdmin: boolean }).isAdmin;
      } else if (token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.email = dbUser.email;
          token.isAdmin = dbUser.isAdmin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        (session.user as { plan?: string }).plan = token.plan as string;
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});
