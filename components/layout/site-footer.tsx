import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

interface SiteFooterProps {
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M13.5 9H15V6.5h-1.5C11.6 6.5 10.5 7.6 10.5 9.5V11H9v2.5h1.5V21h3v-7.5H15l.5-2.5h-2V9.5c0-.3.2-.5.5-.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.7" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const EXPLORE_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Start an enquiry" },
];

export function SiteFooter({
  phone,
  email,
  address,
  facebookUrl,
  instagramUrl,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/images/brand/starkwood-logo.png" alt="" width={32} height={32} className="rounded-full" />
            <span className="font-display text-lg font-bold text-accent">Starkwood</span>
            <span className="text-accent">·</span>
            <span className="font-display text-[11px] font-semibold tracking-[0.2em] text-foreground/50">
              EVENTS
            </span>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Event management and production across Victoria, New South Wales
            and Queensland.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href={facebookUrl}
              aria-label="Facebook"
              className="flex size-10 items-center justify-center rounded-full border border-white/10 transition hover:border-accent hover:text-accent"
            >
              <FacebookIcon />
            </a>
            <a
              href={instagramUrl}
              aria-label="Instagram"
              className="flex size-10 items-center justify-center rounded-full border border-white/10 transition hover:border-accent hover:text-accent"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-bold tracking-[0.14em] text-foreground">Explore</p>
          <ul className="mt-6 space-y-3">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground transition hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold tracking-[0.14em] text-foreground">Services</p>
          <ul className="mt-6 space-y-3">
            <li><Link href="/services" className="text-sm text-muted-foreground transition hover:text-accent">Weddings</Link></li>
            <li><Link href="/services" className="text-sm text-muted-foreground transition hover:text-accent">Corporate Events</Link></li>
            <li><Link href="/services" className="text-sm text-muted-foreground transition hover:text-accent">Music Events</Link></li>
            <li><Link href="/services" className="text-sm text-muted-foreground transition hover:text-accent">Charity Events</Link></li>
            <li><Link href="/services" className="text-sm text-muted-foreground transition hover:text-accent">Cultural Events</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold tracking-[0.14em] text-foreground">Contact</p>
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/40" />
              <span>{address}</span>
            </li>
            <li className="flex gap-3 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0 text-foreground/40" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-accent">
                {phone}
              </a>
            </li>
            <li className="flex gap-3 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0 text-foreground/40" />
              <a href={`mailto:${email}`} className="hover:text-accent">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-white/[0.06] px-6 py-6 text-xs text-foreground/45 sm:flex-row sm:items-center sm:justify-between">
        <p>STARKWOOD PTY LTD © {year}. All Rights Reserved.</p>
        <div className="flex gap-4 opacity-80">
          <a href="https://fm.starkwood.au" className="hover:text-accent">Starkwood FM</a>
          <a href="https://staff.starkwood.au" className="hover:text-accent">Staff</a>
        </div>
      </div>
    </footer>
  );
}
