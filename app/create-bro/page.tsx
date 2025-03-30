'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CreateBroPage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    const worldId = (session?.user as any)?.id;

    if (!worldId || !username) {
      setError("Missing world ID or username.");
      return;
    }

    const response = await fetch('/api/create-bro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ world_id: worldId, username }),
    });

    if (response.ok) {
      setSuccess(true);
    } else {
      const { message } = await response.json();
      setError(message || 'Failed to create bro.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create Your Bro</h1>
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
      >
        Confirm Brohood
      </button>
      {error && <p className="text-red-600 mt-3">{error}</p>}
      {success && <p className="text-green-600 mt-3">Your bro is born. 🫱🏽‍🫲🏾</p>}
    </div>
  );
}
