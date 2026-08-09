import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side client only. Uses the service role key so it can bypass RLS
// for controlled server logic (free-limit checks, webhook writes). NEVER
// import this file from a client component — it must only run in
// route handlers (app/api/**/route.ts), which execute on the server.
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. See .env.example."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return cached;
}
