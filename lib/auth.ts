import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Only log and check for user.id, no DB logic
      console.log("[signIn Callback] User:", JSON.stringify(user, null, 2));
      console.log("[signIn Callback] Account:", JSON.stringify(account, null, 2));
      console.log("[signIn Callback] Profile:", JSON.stringify(profile, null, 2));

      if (!user?.id) {
        console.error("[signIn Callback] Error: User ID is missing.");
        return false;
      }
      // No DB, just allow sign in
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username ?? null;
        console.log("JWT callback - user object:", { id: user.id, name: user.name });
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        console.log("Session callback - updated session:", session);
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};