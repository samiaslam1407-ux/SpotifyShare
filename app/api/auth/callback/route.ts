import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "../../../../lib/spotify";
import { v4 as uuidv4 } from "uuid";
import { saveToken } from "../../../../lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const data: any = await exchangeCodeForToken(code);
  if (!data?.access_token) return NextResponse.json({ error: "Token exchange failed", data }, { status: 500 });

  const shareId = uuidv4();
  const rec = {
    shareId,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
  };

  saveToken(rec as any);

  // Redirect user to their public profile share page
  return NextResponse.redirect(`/profile/${shareId}`);
}
