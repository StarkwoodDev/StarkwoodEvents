import { MapPin } from "lucide-react";

const FOUNDED_YEAR = 2016;

export function Stats() {
  const yearsOperating = new Date().getFullYear() - FOUNDED_YEAR;

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="text-base text-foreground/80">Experience and reach</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-card/70 p-7 backdrop-blur-md">
          <p className="font-mono text-5xl font-bold tracking-tight text-accent-2">{yearsOperating} yrs</p>
          <p className="mt-7 font-display text-lg font-bold text-foreground">
            Producing events across Australia
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Starkwood has been running since {FOUNDED_YEAR}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-card/70 p-7 backdrop-blur-md">
          <p className="font-mono text-5xl font-bold tracking-tight text-accent-2">100+</p>
          <p className="mt-7 font-display text-lg font-bold text-foreground">Events run end to end</p>
          <p className="mt-4 text-sm text-muted-foreground">From intimate parties to arena concerts</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-card/70 p-7 backdrop-blur-md">
          <MapPin className="size-7 text-foreground/80" />
          <p className="mt-7 font-display text-lg font-bold text-foreground">Multi-state reach</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Production across Victoria, New South Wales and Queensland
          </p>
        </div>
      </div>
    </section>
  );
}
