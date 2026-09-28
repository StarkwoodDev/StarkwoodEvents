import "./globals.css";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { safeFetch } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import type { SiteSettings } from "@/lib/types";
import {
  DEFAULT_PHONE,
  DEFAULT_EMAIL,
  DEFAULT_ADDRESS,
  DEFAULT_FACEBOOK_URL,
  DEFAULT_INSTAGRAM_URL,
} from "@/lib/site-config";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-num",
});

export const metadata = {
  title: "Starkwood Events",
  description: "Full-scale event production and entertainment, Melbourne.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await safeFetch<SiteSettings | null>(
    siteSettingsQuery,
    "siteSettings",
    null,
  );

  const phone = settings?.phone || DEFAULT_PHONE;
  const email = settings?.email || DEFAULT_EMAIL;
  const address = settings?.address || DEFAULT_ADDRESS;
  const facebookUrl = settings?.facebookUrl || DEFAULT_FACEBOOK_URL;
  const instagramUrl = settings?.instagramUrl || DEFAULT_INSTAGRAM_URL;

  return (
    <html
      lang="en"
      className={`${syne.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader phone={phone} />
        {children}
        <SiteFooter
          phone={phone}
          email={email}
          address={address}
          facebookUrl={facebookUrl}
          instagramUrl={instagramUrl}
        />
      </body>
    </html>
  );
}
