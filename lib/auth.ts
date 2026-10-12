// ICE WHISPERS — accounts (email + password) via Supabase Auth.
//
// Everything happens server-side: the browser never sees a Supabase key.
// After login the Supabase session tokens are kept in httpOnly cookies and
// verified on each request. Each auth operation uses its OWN short-lived
// Supabase client, so a user's session can never "leak" into the
// service-role client used for database work (lib/supabase.ts).

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const ACCESS_COOKIE = "iw_at";
const REFRESH_COOKIE = "iw_rt";

export interface CurrentUser {
  id: string;
  email: string;
}

export function authClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

export function setSessionCookies(session: { access_token: string; refresh_token: string }) {
  const store = cookies();
  store.set(ACCESS_COOKIE, session.access_token, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
  store.set(REFRESH_COOKIE, session.refresh_token, { ...cookieOpts, maxAge: 60 * 60 * 24 * 60 });
}

export function clearSessionCookies() {
  const store = cookies();
  store.set(ACCESS_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...cookieOpts, maxAge: 0 });
}

/** The logged-in user for this request, or null. Refreshes expired sessions. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!access && !refresh) return null;

  const client = authClient();

  if (access) {
    const { data, error } = await client.auth.getUser(access);
    if (!error && data.user?.email) return { id: data.user.id, email: data.user.email };
  }

  if (refresh) {
    const { data, error } = await client.auth.refreshSession({ refresh_token: refresh });
    if (!error && data.session && data.user?.email) {
      try {
        setSessionCookies(data.session);
      } catch {
        // cookies can't be set in some render contexts; the next API call will refresh again
      }
      return { id: data.user.id, email: data.user.email };
    }
  }

  return null;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}
