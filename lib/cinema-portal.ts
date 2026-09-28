/**
 * Link to the Eda Ra Cinema Portal (the CinemaTracker project), a separate Vercel
 * deployment at events.starkwood.au. The portal publishes its Confirmed/Completed
 * screenings at /api/public/screenings; the home page's movie spotlight shows them,
 * falling back to its built-in list whenever the portal is unreachable or empty.
 */
export const CINEMA_PORTAL_URL = (
  process.env.CINEMA_PORTAL_URL || "https://events.starkwood.au"
).replace(/\/+$/, "");

export const CINEMA_PORTAL_FILM = "eda-ra";

/** Shape of one screening in the portal's public feed. */
export interface PortalScreening {
  date: string | null;
  time: string | null;
  state: string | null;
  city: string | null;
  chain: string | null;
  venue: string | null;
  screen: string | null;
  capacity: number | null;
  soldOut: boolean;
}

/** One row of the movie spotlight's "National screenings" table. */
export interface NationalScreening {
  date: string;
  cinema: string;
  details: string;
  soldOut?: boolean;
  starred?: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

function ordinal(day: number) {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${["th", "st", "nd", "rd"][day % 10] ?? "th"}`;
}

/** "2026-09-27" → "27th Sept", matching the hand-written schedule's style. */
export function formatScreeningDate(iso: string | null): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "TBC";
  return `${ordinal(Number(m[3]))} ${MONTHS[Number(m[2]) - 1]}`;
}

export function toNationalScreening(s: PortalScreening): NationalScreening {
  const cinema = s.venue || s.city || "Cinema to be confirmed";
  const details = s.screen
    ? `${s.venue ?? cinema} | ${s.screen}${s.capacity ? ` (${s.capacity} seats)` : ""}`
    : "";
  return { date: formatScreeningDate(s.date), cinema, details, soldOut: s.soldOut };
}

function isPortalScreening(v: unknown): v is PortalScreening {
  return typeof v === "object" && v !== null && "venue" in v && "date" in v;
}

/**
 * Screenings from the portal, or null when the site should use its built-in list:
 * portal down, slow (5 s timeout), returning an error, or with nothing published yet.
 * Cached for an hour like the Sanity content.
 */
export async function fetchNationalScreenings(): Promise<NationalScreening[] | null> {
  const url = `${CINEMA_PORTAL_URL}/api/public/screenings?film=${CINEMA_PORTAL_FILM}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600, tags: ["screenings"] },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body: unknown = await res.json();
    const list = (body as { screenings?: unknown })?.screenings;
    if (!Array.isArray(list) || !list.every(isPortalScreening)) {
      throw new Error("unexpected response shape");
    }
    return list.length ? list.map(toNationalScreening) : null;
  } catch (err) {
    console.error(`[cinema-portal] ${url} failed, using built-in schedule`, err);
    return null;
  }
}
