import { Check } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

const TRUST_POINTS = [
  "A named producer, not a call centre",
  "Indicative budget range with your first reply",
  "Venue shortlist within three business days",
];

export function ContactCta({ phone, email }: { phone: string; email: string }) {
  return (
    <section id="plan-your-event" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Tell us the date.
            <br />
            We&apos;ll take the plan from there.
          </h2>
          <p className="mt-8 text-base leading-relaxed text-muted-foreground">
            A few details, under a minute. It goes straight to a producer,
            not a generic inbox.
          </p>

          <ul className="mt-10 space-y-4">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-[15px] text-foreground/80">
                <Check className="size-4 shrink-0 text-accent-2" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-accent/25 pt-6 text-sm text-muted-foreground">
            Prefer to talk? Call{" "}
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-semibold text-foreground underline">
              {phone}
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-card/70 p-10 backdrop-blur-md">
          <p className="font-display text-2xl font-bold text-foreground">
            What kind of event are you running?
          </p>
          <div className="mt-6">
            <ContactForm phone={phone} email={email} />
          </div>
        </div>
      </div>
    </section>
  );
}
