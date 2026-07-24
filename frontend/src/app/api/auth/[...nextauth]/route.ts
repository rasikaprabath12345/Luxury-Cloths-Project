import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Backend-ට Google user info send කිරීම
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5226/api"}/Auth/google-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                fullName: user.name,
                avatar: user.image,
                googleId: account.providerAccountId,
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            // Backend JWT token user object-ට attach
            (user as any).backendToken = data.token;
            (user as any).backendId = data.id;
            (user as any).role = data.role;
            (user as any).fullName = data.fullName;
            return true;
          }
          return false;
        } catch (error) {
          console.error("Google login backend error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = (user as any).backendToken;
        token.backendId = (user as any).backendId;
        token.role = (user as any).role;
        token.fullName = (user as any).fullName;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendToken = token.backendToken;
      (session as any).backendId = token.backendId;
      (session as any).role = token.role;
      (session as any).fullName = token.fullName;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };