"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Handle loading state
    if (status === "loading") {
      return; // Do nothing while loading
    }

    // Handle unauthenticated state
    if (status === "unauthenticated") {
      router.push("/api/auth/signin"); // Or your custom sign-in page
      return;
    }

    // Handle authenticated state
    if (status === "authenticated") {
      const checkUsername = async () => {
        const worldId = session?.user?.id;

        if (!worldId) {
          console.error("World ID not found in session.");
          // Handle error appropriately, maybe redirect to an error page or sign-in
          router.push("/api/auth/signin"); 
          return;
        }

        try {
          const { data, error } = await supabase
            .from("users")
            .select("username")
            .eq("world_id", worldId)
            .single();

          if (error) {
            console.error("Error fetching username from Supabase:", error);
            // Handle error appropriately, e.g., show an error message or redirect
            // For now, let's redirect to dashboard as a fallback, 
            // or maybe an error page if you have one.
            router.push("/dashboard"); 
            return;
          }

          if (!data?.username) {
            router.push("/create-bro");
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("An unexpected error occurred:", err);
          // Handle unexpected errors
          router.push("/dashboard"); // Fallback redirect
        }
      };

      checkUsername();
    }
  }, [session, status, router]);

  // Render loading indicator while checking session or redirecting
  if (status === "loading" || status === "authenticated") {
    return <div>Loading your Bromentum...</div>;
  }

  // Optionally, render something else or null if unauthenticated 
  // before redirect kicks in
  return null; 
}
