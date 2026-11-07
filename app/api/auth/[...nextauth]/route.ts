import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ensureInstitutionalUsers, prisma } from "@/lib/prisma";

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credencial Institucional MFV Advocacia",
      credentials: {
        email: { label: "E-mail Institucional", type: "email" },
        oabOuCodigo: { label: "Inscrição OAB/PB ou Código de Acesso", type: "password" },
      },
      async authorize(credentials) {
        await ensureInstitutionalUsers();
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });

        if (!user || !user.ativo) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          oab: user.oab,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role?: string }).role;
        token.oab = (user as unknown as { oab?: string | null }).oab;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { role?: unknown }).role = token.role;
        (session.user as unknown as { oab?: unknown }).oab = token.oab;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
