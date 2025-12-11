import { NextResponse } from "next/server";
import { getNowPlayingForShare } from "../../../../lib/spotify";

export async function GET(req: Request, { params }: { params: { shareId: string } }) {
  const id = params.shareId;
  const now = await getNowPlayingForShare(id);
  if (!now) return NextResponse.json({ nowPlaying: null });
  return NextResponse.json({ nowPlaying: now });
}
