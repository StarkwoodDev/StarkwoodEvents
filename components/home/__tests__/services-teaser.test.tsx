import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServicesTeaser } from "../services-teaser";

const services = [
  { _id: "1", title: "Weddings", slug: "weddings", icon: "💍", summary: "Full-service wedding production." },
  { _id: "2", title: "Corporate Events", slug: "corporate-events", icon: "🏢", summary: "Product launches and conferences." },
  { _id: "3", title: "Music Events", slug: "music-events", icon: "🎤", summary: "Concert production." },
];

describe("ServicesTeaser", () => {
  it("renders a link for each service pointing at its own detail page", () => {
    render(<ServicesTeaser services={services} />);
    expect(screen.getByRole("link", { name: /weddings/i })).toHaveAttribute("href", "/services/weddings");
    expect(screen.getByRole("link", { name: /corporate events/i })).toHaveAttribute(
      "href",
      "/services/corporate-events",
    );
    expect(screen.getByRole("link", { name: /music events/i })).toHaveAttribute(
      "href",
      "/services/music-events",
    );
  });

  it("renders nothing when there are no services", () => {
    const { container } = render(<ServicesTeaser services={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
