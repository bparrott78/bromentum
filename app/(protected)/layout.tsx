import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Import from the new location
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the session on the server
  const session = await getServerSession(authOptions);

  // 2. If not logged in, go to sign-in page
  if (!session) {
    redirect("/api/auth/signin");
  }

  // 3. If user is missing a username, send them to create-bro
  if (!session.user?.username) {
    redirect("/create-bro");
  }

  return (
    <div>
      {/* 4. Show a header with session info */}
      <Header session={session} />
      <main>{children}</main>
    </div>
  );
}
