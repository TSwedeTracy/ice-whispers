// ICE WHISPERS — where visitors come from (no extra cookies).
//
// Short addresses for social posts and bios (handled in middleware.ts):
//   icewhispers.com/ig → Instagram, /fb → Facebook, /tt → TikTok
// The start page sends the source and the referring site with its first
// request to /api/entitlement; it is saved once, on the visitor row, when
// the visitor is created. See the Supabase view `traffic_by_source`.

export const SHORT_LINKS: Record<string, string> = {
  ig: "instagram",
  fb: "facebook",
  tt: "tiktok",
};

export interface FirstTouch {
  source: string;
  referrer: string | null;
  campaign: string | null;
  landing: string | null;
}

function sourceFromHost(host: string): string {
  if (/instagram/.test(host)) return "instagram";
  if (/facebook|(^|\.)fb\.|messenger/.test(host)) return "facebook";
  if (/tiktok/.test(host)) return "tiktok";
  if (/google\./.test(host)) return "google";
  if (/bing\.|duckduckgo|yahoo\./.test(host)) return "search";
  if (/linkedin|lnkd/.test(host)) return "linkedin";
  if (/youtube|youtu\.be/.test(host)) return "youtube";
  return host;
}

const clean = (v: string | null, max: number) => (v ? v.toLowerCase().replace(/[^a-z0-9._\-/]/g, "").slice(0, max) || null : null);

/** Reads ?src=, ?ref=, ?c=, ?l= sent by the start page. */
export function firstTouchFrom(params: URLSearchParams): FirstTouch {
  const src = clean(params.get("src"), 40);
  let ref = clean(params.get("ref"), 100);
  if (ref?.endsWith("icewhispers.com")) ref = null;
  return {
    source: src ?? (ref ? sourceFromHost(ref) : "direct"),
    referrer: ref,
    campaign: clean(params.get("c"), 60),
    landing: clean(params.get("l"), 60),
  };
}
