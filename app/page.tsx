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
    if (status !== "authenticated") return;

    const checkUsername = async () => {
      const worldId = session?.user?.id;

      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("world_id", worldId)
        .single();

      if (!data?.username) {
        router.push("/create-bro");
      } else {
        router.push("/dashboard"); // Or wherever your main app lives
      }
    };

    checkUsername();
  }, [session, status, router]);

  return <div>Loading your Bromentum...</div>;
}
