import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            console.log("Login attempt failed: Missing credentials for identifier:", credentials?.identifier);
            return null;
          }

          const identifier = credentials.identifier as string;

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: identifier },
                { username: identifier },
              ],
            },
          });

          if (!user || !user.password) {
            console.log("Login attempt failed: User not found or no password for identifier:", identifier);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Login attempt failed: Invalid password for user:", identifier);
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Login error in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
