import { NextAuthOptions } from "next-auth";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    async signIn({ user }) {
      const worldId = user.id;
      const walletAddress = user.name;

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('world_id', worldId)
        .single();

      if (!existingUser) {
        const { error: insertError } = await supabase.from('users').insert({
          world_id: worldId,
          wallet_address: walletAddress,
        });

        if (insertError) {
          console.error('❌ Failed to insert user:', insertError);
          return false;
        }

        console.log('✅ New user created:', worldId);
      } else {
        console.log('✅ Existing user logged in:', worldId);
      }

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