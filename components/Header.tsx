"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Header({ session }: { session: any }) {
  const username = session.user?.username || "Unknown Bro";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem",
        background: "#333",
        color: "#fff",
      }}
    >
      <div>Welcome, {username}</div>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link href="/(protected)/dashboard">Dashboard</Link>
        <button onClick={handleSignOut}>Sign Out</button>
      </nav>
    </header>
  );
}
