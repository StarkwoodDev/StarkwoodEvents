import Image from "next/image";

export const metadata = { title: "About | Starkwood Events" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        About <span className="text-gradient-gold">Starkwood Events</span>
      </h1>
      <p className="mt-6 text-[var(--muted-foreground)]">
        Starkwood Events is a full-scale event production and entertainment company based in
        Melbourne. Our team has delivered arena concerts, cultural festivals, corporate launches,
        and pageants across Victoria — handling everything from production management and
        staging to lighting, audio, and on-the-ground crew.
      </p>
      <p className="mt-4 text-[var(--muted-foreground)]">
        From Sri Lankan concert tours at the Palais Theatre and Sidney Myer Music Bowl to
        the Miss Earth Australia pageant and vintage-themed corporate galas, we bring the same
        production discipline to every scale of event.
      </p>
      <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src="/team.jpg"
          alt="The Starkwood Events team"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </main>
  );
}
