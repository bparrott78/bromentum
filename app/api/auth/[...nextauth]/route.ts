import NextAuth, { NextAuthOptions } from "next-auth";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const authOptions: NextAuthOptions = {
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
      // Add the world ID to the token
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Push the world ID into the session so your app can access it
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },


  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
