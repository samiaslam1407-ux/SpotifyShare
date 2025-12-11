import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  const scopes = ["user-read-currently-playing", "user-read-playback-state"];

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("client_id", clientId || "");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri || "");
  url.searchParams.set("scope", scopes.join(" "));

  return NextResponse.redirect(url.toString());
}
