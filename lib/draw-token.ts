// Signed "draw tokens" tie each AI reading to a real, paid-for/allowed draw.
//
// /api/draw (which enforces the free limit, day pass and monthly quota)
// signs the drawn cards + question; /api/reading only generates a reading
// for a valid, unused token. Without this, someone could call
// /api/reading directly in a loop and run up unlimited AI costs.
//
// Uses the Web Crypto API so it works in the edge runtime. The signing key
// is DRAW_SIGNING_SECRET if set, otherwise the (server-only) Supabase
// service role key — no new environment variable is required.

export interface DrawPayload {
  id: string; // becomes the readings.id — makes every token single-use
  v: string; // visitor id
  s: "daily" | "three_norns" | "five_cross";
  c: { runeId: number; reversed: boolean; position?: string }[];
  q: string; // sha-256 of the question
  t: number; // issued at (ms)
}

const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes to finish a reading

function secret(): string {
  const s = process.env.DRAW_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("Missing DRAW_SIGNING_SECRET / SUPABASE_SERVICE_ROLE_KEY");
  return s;
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(new Uint8Array(sig));
}

export async function hashQuestion(question: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(question.trim()));
  return b64url(new Uint8Array(digest));
}

export async function signDraw(payload: DrawPayload): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body)}`;
}

export async function verifyDraw(token: unknown): Promise<DrawPayload | null> {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmac(body);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as DrawPayload;
    if (Date.now() - payload.t > MAX_AGE_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
