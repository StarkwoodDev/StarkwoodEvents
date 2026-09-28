import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { CINEMA_PORTAL_FILM, CINEMA_PORTAL_URL } from "@/lib/cinema-portal";

// Env vars the site needs in production. Reported as booleans only — values
// are never included in the response.
const REQUIRED_ENV = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_REVALIDATE_SECRET",
  "RESEND_API_KEY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
] as const;

/**
 * Liveness + dependency check for uptime monitors. Returns 503 when the CMS
 * is unreachable so monitors alert, even though pages keep serving cached or
 * fallback content during a Sanity outage.
 */
export async function GET() {
  let sanity: "ok" | "error" = "ok";
  try {
    await client.fetch("count(*[_type == 'siteSettings'])", {}, { cache: "no-store" });
  } catch (err) {
    console.error("[health] Sanity check failed", err);
    sanity = "error";
  }

  // Informational only: the site falls back to its built-in schedule when the
  // portal is down, so this never marks the site as degraded.
  let cinemaPortal: "ok" | "error" = "ok";
  try {
    const res = await fetch(`${CINEMA_PORTAL_URL}/api/public/screenings?film=${CINEMA_PORTAL_FILM}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("[health] Cinema Portal check failed", err);
    cinemaPortal = "error";
  }

  const env = Object.fromEntries(REQUIRED_ENV.map((k) => [k, Boolean(process.env[k])]));
  const status = sanity === "ok" ? "ok" : "degraded";

  return NextResponse.json(
    { status, checks: { sanity, cinemaPortal, env }, time: new Date().toISOString() },
    { status: status === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
