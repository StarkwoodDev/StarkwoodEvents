import { notFound } from "next/navigation";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { safeFetch } from "@/sanity/client";
import { serviceBySlugQuery, serviceSlugsQuery } from "@/lib/queries";
import type { ServiceDetail } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await safeFetch<string[]>(serviceSlugsQuery, "service", []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await safeFetch<ServiceDetail | null>(serviceBySlugQuery, "service", null, {
    slug,
  });
  if (!service) return {};
  return { title: `${service.title} | Starkwood Events` };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await safeFetch<ServiceDetail | null>(serviceBySlugQuery, "service", null, {
    slug,
  });

  if (!service) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-4xl">{service.icon}</div>
      <h1 className="mt-3 font-display text-4xl text-[var(--foreground)]">{service.title}</h1>
      {service.description && (
        <div className="prose prose-invert mt-8 max-w-none">
          <PortableText value={service.description as PortableTextBlock[]} />
        </div>
      )}
    </main>
  );
}
