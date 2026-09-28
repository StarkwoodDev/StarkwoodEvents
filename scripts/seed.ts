import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { join } from "path";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

const IMGS_DIR = join(__dirname, "../Imgs");

async function uploadImage(filename: string) {
  const path = join(IMGS_DIR, filename);
  const asset = await writeClient.assets.upload("image", readFileSync(path), { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function upsert(id: string, doc: Record<string, unknown> & { _type: string }) {
  return writeClient.createOrReplace({ _id: id, ...doc });
}

async function main() {
  // 1. Site settings
  await upsert("siteSettings", {
    _type: "siteSettings",
    phone: "+61 416 340 773",
    email: "events@starkwood.au",
    address: "Unit 2/198 Rooks Rd, Vermont VIC 3133",
    facebookUrl: "https://www.facebook.com/StarkwoodEvents/",
    instagramUrl: "https://www.instagram.com/starkwood.events/",
    heroHeadline: "Full-Scale Events. Flawlessly Produced.",
    heroSubheadline:
      "From arena concerts to cultural galas, Starkwood Events brings Melbourne's biggest nights to life.",
  });

  // 2. Services — real, distinct content for each of the ten categories
  const services = [
    {
      slug: "weddings",
      title: "Weddings",
      icon: "💍",
      summary: "Full-service wedding production, from staging to sound.",
      body:
        "We handle the production side of your wedding day — staging, lighting, sound, and on-the-day coordination — so the day runs exactly as planned.",
    },
    {
      slug: "corporate-events",
      title: "Corporate Events",
      icon: "🏢",
      summary: "Product launches, conferences, and company celebrations.",
      body:
        "From product launches to conference staging, we deliver corporate events with the same production discipline we bring to arena concerts.",
    },
    {
      slug: "music-events",
      title: "Music Events",
      icon: "🎤",
      summary: "Concert production for touring and local artists.",
      body:
        "Full concert production — staging, audio, lighting, and crew — for touring international artists and local acts alike, at venues from intimate lounges to the Sidney Myer Music Bowl.",
    },
    {
      slug: "personal-events-parties",
      title: "Personal Events & Parties",
      icon: "🎉",
      summary: "Milestone birthdays, anniversaries, and private parties.",
      body:
        "Milestone birthdays, anniversaries, and private celebrations, produced with the same care as our largest public shows.",
    },
    {
      slug: "charity-events",
      title: "Charity Events",
      icon: "🤝",
      summary: "Galas and fundraisers that do justice to the cause.",
      body:
        "Charity galas and fundraising nights, produced to feel every bit as premium as a ticketed concert — because the cause deserves it.",
    },
    {
      slug: "cultural-events",
      title: "Cultural Events",
      icon: "🎭",
      summary: "Festivals and cultural celebrations for Melbourne's communities.",
      body:
        "We've produced some of Melbourne's biggest Sri Lankan cultural nights and concert tours, bringing international artists to local stages.",
    },
    {
      slug: "sporting-events",
      title: "Sporting Events",
      icon: "🏆",
      summary: "Presentation nights, tournaments, and sporting galas.",
      body:
        "Presentation nights, tournament finals, and sporting galas — staged, lit, and run to schedule.",
    },
    {
      slug: "food-wine-events",
      title: "Food & Wine Events",
      icon: "🍷",
      summary: "Tastings, launches, and culinary showcases.",
      body:
        "Food and wine tastings, launches, and showcase events, produced with attention to both atmosphere and logistics.",
    },
    {
      slug: "community-events",
      title: "Community Events",
      icon: "🌏",
      summary: "Public festivals and community celebrations.",
      body:
        "Public festivals and community celebrations, produced to bring people together safely and memorably.",
    },
    {
      slug: "other-events",
      title: "Other Events",
      icon: "✨",
      summary: "Something else in mind? Let's talk.",
      body: "Not seeing your event type listed? Get in touch — if it needs a stage, sound, and a plan, we can produce it.",
    },
  ];

  for (const [i, s] of services.entries()) {
    await upsert(`service-${s.slug}`, {
      _type: "service",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      icon: s.icon,
      summary: s.summary,
      order: i,
      description: [
        {
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: s.body }],
        },
      ],
    });
  }

  // 3. Sponsors referenced by seed events (logo-less for now — logo can be added in Studio later)
  const sponsorNames = [
    "Maaz Events",
    "Mega Live Events",
    "My Flight Zone",
    "Sanni 18",
    "Ticketek Australia",
    "Shawn Mendis Lawyers",
    "Arts Centre Melbourne",
    "Aus News Lanka",
    "7 Zone Entertainment",
    "Nexxt Entertainment",
    "ShowUp Global",
    "A9 Events",
    "Stereo 6 Events",
    "South Aura Events",
    "Awakasha Entertainment",
    "Home Lands Australia",
  ];
  const sponsorRefs: Record<string, { _type: "reference"; _ref: string }> = {};
  for (const name of sponsorNames) {
    const id = `sponsor-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await upsert(id, { _type: "sponsor", name });
    sponsorRefs[name] = { _type: "reference", _ref: id };
  }

  // 4. Upcoming event
  const naadhaGamaCover = await uploadImage("concert.jpg");
  await upsert("event-naadha-gama-melbourne-2026", {
    _type: "event",
    title: "Naadha Gama Melbourne 2026",
    slug: { _type: "slug", current: "naadha-gama-melbourne-2026" },
    status: "upcoming",
    category: "Concert",
    startDate: "2026-10-31",
    venue: "Sidney Myer Music Bowl, Melbourne",
    starkwoodRole: "Production Partner",
    summary: "A new chapter for Sri Lankan music in Australia.",
    description: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text:
              "A reimagined live concert extension of the Naadha Gama 360 experience with Eshan Denipitiya and The Orchestra of Eshan Denipitiya, featuring Methun SK, Ridma Weerawardena, Dhanith Sri, Supun Perera, Dinesh Gamage, Kanchana Anuradhi, and Manuranga Wijesekara.",
          },
        ],
      },
    ],
    coverImage: naadhaGamaCover,
    infoUrl: "https://naadhagama.lk/melbourne26",
    ticketUrl: "https://premier.ticketek.com.au/shows/show.aspx?sh=NGAPLVSM26",
    sponsors: [
      sponsorRefs["Maaz Events"],
      sponsorRefs["Mega Live Events"],
      sponsorRefs["My Flight Zone"],
      sponsorRefs["Sanni 18"],
      sponsorRefs["Ticketek Australia"],
      sponsorRefs["Shawn Mendis Lawyers"],
      sponsorRefs["Arts Centre Melbourne"],
      sponsorRefs["Aus News Lanka"],
    ],
  });

  // 5. Past projects
  //
  // Gallery photos below are drawn from the WhatsApp exports in Imgs/. Some
  // are confirmed matches (visible on-screen branding for that exact event);
  // the rest are real Starkwood-produced concert photography (same sponsor
  // networks / crew / photographer) used as generic crowd/stage filler per
  // the design spec ("Photo gallery for the other seed events is drawn from
  // the Imgs/ folder"). None reference the retired travel-partnership brand
  // that must never appear on this site, and none are attached to the
  // Ru Sanda Rae Finale Tour — that event still awaits first-party photos
  // from Dhanuka per the spec.
  const alutKalawakCover = await uploadImage("concert.jpg");
  const alutKalawakGallery = await Promise.all([
    // Exact match: on-screen "අලුත් කලාවක WORLD TOUR" branding with the
    // 7 Zone Entertainment / Nexxt Entertainment / ShowUp Global sponsor logos.
    uploadImage("WhatsApp Image 2025-05-22 at 21.50.03_d2529ce2.jpg"),
    uploadImage("WhatsApp Image 2025-05-22 at 21.49.59_ab40c586.jpg"),
    uploadImage("WhatsApp Image 2025-05-22 at 21.50.01_3f099b21.jpg"),
  ]);
  await upsert("event-aluth-kalawak-melbourne-edition", {
    _type: "event",
    title: "Aluth Kalawak — Melbourne Edition",
    slug: { _type: "slug", current: "aluth-kalawak-melbourne-edition" },
    status: "past",
    category: "Concert",
    startDate: "2023-10-13",
    venue: "Trak Live Lounge Bar, Melbourne",
    starkwoodRole: "Production Managed",
    summary: "A sold-out night of Sri Lankan music legends, live in Melbourne.",
    coverImage: alutKalawakCover,
    gallery: alutKalawakGallery,
    sponsors: [
      sponsorRefs["7 Zone Entertainment"],
      sponsorRefs["Nexxt Entertainment"],
      sponsorRefs["ShowUp Global"],
    ],
  });

  const dhwaniGallery = await Promise.all([
    uploadImage("WhatsApp Image 2025-05-22 at 21.50.05_c3be5d16.jpg"),
    uploadImage("WhatsApp Image 2025-05-22 at 21.50.04_5506f43e.jpg"),
  ]);
  await upsert("event-dhwani-live-2025", {
    _type: "event",
    title: "Dhwani (ධ්වනි) Live in Concert 2025",
    slug: { _type: "slug", current: "dhwani-live-in-concert-2025" },
    status: "past",
    category: "Concert",
    startDate: "2025-11-07",
    endDate: "2025-11-09",
    venue: "The Besen Centre, Melbourne",
    starkwoodRole: "Production",
    summary: "A full-scale concert production at The Besen Centre.",
    gallery: dhwaniGallery,
    sponsors: [sponsorRefs["Awakasha Entertainment"]],
  });

  const sarithSurithGallery = await Promise.all([
    // Sponsor logos (A9 Events, Stereo 6 Events, Starkwood Events) match this
    // event's own documented production partners.
    uploadImage("WhatsApp Image 2025-05-22 at 22.13.30_a5ebcf5b.jpg"),
    uploadImage("WhatsApp Image 2025-05-22 at 21.50.05_f56a4599.jpg"),
  ]);
  await upsert("event-sarith-surith-x-hana-2025", {
    _type: "event",
    title: "Sarith Surith and the News x Hana Shafa — Live in Melbourne",
    slug: { _type: "slug", current: "sarith-surith-x-hana-shafa-live-in-melbourne" },
    status: "past",
    category: "Concert",
    startDate: "2025-11-14",
    venue: "Melbourne Pavilion",
    starkwoodRole: "Event Production",
    summary: "Sarith Surith and the News joined by Hana Shafa, live in Melbourne.",
    gallery: sarithSurithGallery,
    sponsors: [sponsorRefs["A9 Events"], sponsorRefs["Stereo 6 Events"], sponsorRefs["South Aura Events"]],
  });

  const homeLandsGallery = await Promise.all([
    // Exact match: on-screen "Home Lands Group of Companies" branding.
    uploadImage("WhatsApp Image 2025-05-22 at 21.45.53_148b22c9.jpg"),
    uploadImage("WhatsApp Image 2025-05-22 at 21.50.05_012c94e7.jpg"),
  ]);
  await upsert("event-home-lands-prestige-night-2025", {
    _type: "event",
    title: "Home Lands Prestige Night 2025",
    slug: { _type: "slug", current: "home-lands-prestige-night-2025" },
    status: "past",
    category: "Corporate",
    startDate: "2025-10-28",
    venue: "Springvale City Hall, Melbourne",
    starkwoodRole: "Production",
    summary: "A Great Gatsby-themed prestige night with Home Lands Australia.",
    gallery: homeLandsGallery,
    sponsors: [sponsorRefs["Home Lands Australia"]],
  });

  await upsert("event-news-live-on-tour-2025", {
    _type: "event",
    title: "News Live on Tour 2025 — Melbourne",
    slug: { _type: "slug", current: "news-live-on-tour-2025-melbourne" },
    status: "past",
    category: "Concert",
    startDate: "2025-10-12",
    venue: "Melbourne",
    starkwoodRole: "Production",
    summary: "Sarith Surith and the News, live in Melbourne.",
  });

  await upsert("event-ru-sanda-rae-finale-tour-2024", {
    _type: "event",
    title: "Ru Sanda Rae Finale Tour — Australian Tour 2024",
    slug: { _type: "slug", current: "ru-sanda-rae-finale-tour-2024" },
    status: "past",
    category: "Concert",
    startDate: "2024-09-01",
    venue: "Palais Theatre, St Kilda",
    summary:
      "A grand Sri Lankan musical evening featuring Rookantha, Chandralekha, Raini, Windy, Sanuka, and Suresh.",
    sponsors: [sponsorRefs["Shawn Mendis Lawyers"]],
    // No coverImage set: no first-party Starkwood photos of this event were found.
    // Add one in Studio once Dhanuka supplies photography for this event.
  });

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
