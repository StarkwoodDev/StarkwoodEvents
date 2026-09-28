"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Starkwood" className="flex items-center gap-2 whitespace-nowrap">
          <Image src="/images/brand/starkwood-logo.png" alt="" width={36} height={36} className="rounded-full" />
          <span className="font-display text-lg font-bold text-accent">Starkwood</span>
          <span className="text-accent">·</span>
          <span className="font-display text-[11px] font-semibold tracking-[0.2em] text-foreground/50">
            EVENTS
          </span>
        </Link>

        <nav className="hidden gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-sm text-accent-2 hover:text-accent">
            {phone}
          </a>
          <Link
            href="/contact"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_10px_15px_rgba(197,139,56,0.35)] transition hover:brightness-110"
          >
            Plan your event
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex items-center justify-center rounded-full border border-white/10 p-2 text-foreground transition hover:border-accent hover:text-accent md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/[0.06] bg-background px-6 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-foreground transition hover:bg-card hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-accent-2 transition hover:bg-card"
            >
              {phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
