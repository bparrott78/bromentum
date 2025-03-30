'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateBroPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const worldId = session?.user?.id;

    if (!worldId || !username) {
      setError("Missing world ID or username.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ username })
      .eq('world_id', worldId);

    if (updateError) {
      setError("Could not set your bro name.");
      console.error(updateError);
      setLoading(false);
      return;
    }

    router.push('/dashboard'); // Change this to your post-setup page
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-4">Create Your Bro Name</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your bro name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Submitting...' : 'Set My Bro Name'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
