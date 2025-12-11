"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Now = {
  isPlaying: boolean;
  trackName: string;
  artistName: string;
  albumArt: string;
  externalUrl: string;
  progress: number;
  duration: number;
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [now, setNow] = useState<Now | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchNow() {
    try {
      const res = await fetch(`/api/now/${id}`);
      const data = await res.json();
      setNow(data.nowPlaying);
    } catch (e) {
      setNow(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNow();
    const t = setInterval(fetchNow, 8000);
    return () => clearInterval(t);
  }, [id]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Now Playing</h2>
        {loading ? (
          <p>Loading…</p>
        ) : now ? (
          <div className="flex gap-4 items-center">
            <img src={now.albumArt} alt="cover" className="w-20 h-20 rounded-md object-cover" />
            <div>
              <div className="font-bold">{now.trackName}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{now.artistName}</div>
              <a href={now.externalUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open in Spotify</a>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No track playing currently.</p>
        )}
      </div>
    </main>
  );
}
