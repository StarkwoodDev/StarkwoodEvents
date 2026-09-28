import { GalleryGrid, type GalleryGroup } from "@/components/gallery/gallery-grid";
import { safeFetch } from "@/sanity/client";
import { eventGalleriesQuery } from "@/lib/queries";

export const metadata = { title: "Gallery | Starkwood Events" };

export default async function GalleryPage() {
  const groups = await safeFetch<GalleryGroup[]>(eventGalleriesQuery, "event", []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        Photo <span className="text-gradient-gold">Gallery</span>
      </h1>
      <div className="mt-8">
        <GalleryGrid groups={groups} />
      </div>
    </main>
  );
}
