import fetch from "node-fetch";
import { getToken, saveToken } from "./store";

export type NowPlaying = {
  isPlaying: boolean;
  trackName: string;
  artistName: string;
  albumArt: string;
  externalUrl: string;
  progress: number;
  duration: number;
};

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function exchangeCodeForToken(code: string) {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri || "",
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return res.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return res.json();
}

export async function getNowPlayingForShare(shareId: string): Promise<NowPlaying | null> {
  const rec = getToken(shareId);
  if (!rec) return null;

  // refresh if expired
  if (rec.expiresAt && Date.now() > rec.expiresAt - 60000 && rec.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(rec.refreshToken);
      if (refreshed.access_token) {
        rec.accessToken = refreshed.access_token;
        if (refreshed.expires_in) rec.expiresAt = Date.now() + refreshed.expires_in * 1000;
        saveToken(rec);
      }
    } catch (e) {
      console.error("refresh failed", e);
    }
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${rec.accessToken}` },
    });
    if (res.status === 204) return null;
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.item) return null;

    return {
      isPlaying: !!data.is_playing,
      trackName: data.item.name,
      artistName: data.item.artists?.map((a: any) => a.name).join(", ") || "",
      albumArt: data.item.album?.images?.[0]?.url || "",
      externalUrl: data.item.external_urls?.spotify || "",
      progress: data.progress_ms || 0,
      duration: data.item.duration_ms || 0,
    };
  } catch (e) {
    console.error("now playing fetch error", e);
    return null;
  }
}
