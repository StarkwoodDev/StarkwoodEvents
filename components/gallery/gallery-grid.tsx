import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

export interface GalleryGroup {
  title: string;
  slug: string;
  imageUrls: string[];
}

export function GalleryGrid({ groups }: { groups: GalleryGroup[] }) {
  if (groups.length === 0) {
    return <EmptyState message="Photos coming soon" />;
  }

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.slug}>
          <Link
            href={`/events/${group.slug}`}
            className="font-display text-xl text-[var(--foreground)] hover:text-[var(--accent)]"
          >
            {group.title}
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {group.imageUrls.map((url, i) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={url}
                  alt={`${group.title} photo ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
