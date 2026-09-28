import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags: string[];
}): Promise<T> {
  return client.fetch<T>(query, params, {
    cache: "force-cache",
    // Tag-based on-demand revalidation is the primary invalidation path (see
    // app/api/revalidate/route.ts), but a 1-hour time-based fallback ensures
    // pages recover on their own if the webhook is ever misconfigured
    // (wrong secret, delivery failure) rather than freezing indefinitely.
    next: { tags, revalidate: 3600 },
  });
}

/**
 * Fetch wrapper that swallows Sanity errors and returns a fallback instead of
 * throwing. Used by every page's data fetch so a Sanity outage degrades to
 * empty/fallback content rather than failing a static build or crashing at
 * request time.
 */
export async function safeFetch<T>(
  query: string,
  tag: string,
  fallback: T,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    return await sanityFetch<T>({ query, params, tags: [tag] });
  } catch (err) {
    // Logged so a CMS outage shows up in Vercel runtime/build logs instead of
    // silently rendering fallback content.
    console.error(`[sanity] fetch for "${tag}" failed, serving fallback`, err);
    return fallback;
  }
}
