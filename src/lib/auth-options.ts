import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import FamilyUserModel, { type FamilyUserDocument } from '@/models/FamilyUser';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    // Stay signed in for a long family-app session (30 days).
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/en/login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Family login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        const password = credentials?.password ?? '';
        if (!username || !password) {
          return null;
        }

        await dbConnect();
        const user = await FamilyUserModel.findOne({ username, active: true })
          .lean<FamilyUserDocument | null>();
        if (!user?.passwordHash) {
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          return null;
        }

        return {
          id: String(user._id),
          name: user.displayName,
          email: `${user.username}@family.local`,
          // custom fields via callbacks
          username: user.username,
          role: user.role,
        } as {
          id: string;
          name: string;
          email: string;
          username: string;
          role: string;
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; username?: string; role?: string; name?: string | null };
        token.sub = u.id;
        token.username = u.username;
        token.role = u.role;
        token.name = u.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.username = typeof token.username === 'string' ? token.username : '';
        session.user.role = typeof token.role === 'string' ? token.role : 'member';
        session.user.name = token.name ?? session.user.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
