import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

type TokenRecord = {
  shareId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TOKENS_FILE)) fs.writeFileSync(TOKENS_FILE, JSON.stringify([]));
}

export function readTokens(): TokenRecord[] {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(TOKENS_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

export function writeTokens(tokens: TokenRecord[]) {
  ensureDataDir();
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

export function saveToken(rec: TokenRecord) {
  const tokens = readTokens();
  const idx = tokens.findIndex((t) => t.shareId === rec.shareId);
  if (idx >= 0) tokens[idx] = rec;
  else tokens.push(rec);
  writeTokens(tokens);
}

export function getToken(shareId: string): TokenRecord | undefined {
  const tokens = readTokens();
  return tokens.find((t) => t.shareId === shareId);
}
