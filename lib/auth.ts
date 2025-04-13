import { NextAuthOptions } from "next-auth";
import { createClient } from '@supabase/supabase-js';

// Log the environment variables right before creating the client
console.log('[Supabase Init] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('[Supabase Init] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); // Log existence, not the key itself for security

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create a Supabase client for server-side operations using the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use the service role key for admin operations
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
    async signIn({ user, account, profile }) { // Added account and profile for more context
      console.log("[signIn Callback] User:", JSON.stringify(user, null, 2));
      console.log("[signIn Callback] Account:", JSON.stringify(account, null, 2));
      console.log("[signIn Callback] Profile:", JSON.stringify(profile, null, 2));

      if (!user?.id) {
        console.error("[signIn Callback] Error: User ID is missing.");
        return false; // Cannot proceed without user ID
      }

      const worldId = user.id;
      // Let's be safer, check if name exists, otherwise use a placeholder or handle differently
      const walletAddress = user.name ?? null; // Use null if name is missing

      console.log(`[signIn Callback] Attempting to find/create user for world_id: ${worldId}`);

      try {
        // Use the admin client to bypass RLS and check for existing users
        const { data: existingUser, error: selectError } = await supabaseAdmin
          .from('users')
          .select('*') // Select all columns for debugging
          .eq('world_id', worldId)
          .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116: "Row to return was not found" - expected if user is new
          console.error('[signIn Callback] Supabase select error:', selectError);
          return false; // Indicate sign-in failure
        }

        if (existingUser) {
          console.log('[signIn Callback] ✅ Existing user found:', JSON.stringify(existingUser, null, 2));
        } else {
          console.log(`[signIn Callback] No existing user found. Attempting to insert new user with world_id: ${worldId}, wallet_address: ${walletAddress}`);
          const { error: insertError } = await supabaseAdmin.from('users').insert({
            world_id: worldId,
            wallet_address: walletAddress, // Use the potentially null walletAddress
          });

          if (insertError) {
            console.error('[signIn Callback] ❌ Failed to insert user:', insertError);
            return false; // Indicate sign-in failure
          }

          console.log(`[signIn Callback] ✅ New user created for world_id: ${worldId}`);
        }

        console.log("[signIn Callback] Sign-in successful.");
        return true; // Indicate sign-in success
      } catch (err) {
        console.error("[signIn Callback] Unexpected error during Supabase operation:", err);
        return false; // Indicate sign-in failure on unexpected errors
      }
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