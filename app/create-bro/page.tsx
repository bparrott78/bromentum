'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateBroPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Debug session data
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    const worldId = session?.user?.id;

    if (!worldId) {
      setError("Not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await fetch('/api/create-bro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ world_id: worldId, username }),
      });

      if (response.ok) {
        setSuccess(true);
        // Refresh session to get updated username
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create bro.');
      }
    } catch (err) {
      console.error("Error creating bro:", err);
      setError("An unexpected error occurred.");
    }
  };

  if (status === "loading") {
    return <div className="p-6">Loading session...</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create Your Bro</h1>
      <p className="mb-4">Welcome! Choose a username to continue:</p>

      <input
        type="text"
        placeholder="Choose your bro name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={status !== "authenticated"}
      >
        Confirm Brohood
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}
      {success && <p className="text-green-600 mt-3">Your bro is born. 🫱🏽‍🫲🏾</p>}

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Session Status: {status}</p>
          <p>User ID: {session?.user?.id || "Not available"}</p>
        </div>
      )}
    </div>
  );
}
