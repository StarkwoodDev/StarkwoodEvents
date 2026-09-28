import type { Testimonial } from "@/lib/types";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-center">
      <h2 className="font-display text-3xl text-[var(--foreground)]">
        What <span className="text-gradient-gold">Clients Say</span>
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {testimonials.map((t) => (
          <blockquote key={t._id} className="text-[var(--muted-foreground)]">
            <p>&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-3 text-sm text-[var(--accent)]">
              {t.author}
              {t.role ? `, ${t.role}` : ""}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
