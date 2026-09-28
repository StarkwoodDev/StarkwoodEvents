import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "../site-footer";

const props = {
  phone: "+61 416 340 773",
  email: "events@starkwood.au",
  address: "Unit 2/198 Rooks Rd, Vermont VIC 3133",
  facebookUrl: "https://www.facebook.com/StarkwoodEvents/",
  instagramUrl: "https://www.instagram.com/starkwood.events/",
};

describe("SiteFooter", () => {
  it("renders phone, email, and address exactly as passed in", () => {
    render(<SiteFooter {...props} />);
    expect(screen.getByText(props.phone)).toBeInTheDocument();
    expect(screen.getByText(props.email)).toBeInTheDocument();
    expect(screen.getByText(props.address)).toBeInTheDocument();
  });

  it("never renders any mention of Unforgettable Sri Lanka", () => {
    render(<SiteFooter {...props} />);
    expect(screen.queryByText(/unforgettable sri lanka/i)).not.toBeInTheDocument();
  });

  it("links to Facebook and Instagram, and to the fm/staff subdomains only as small links", () => {
    render(<SiteFooter {...props} />);
    expect(screen.getByRole("link", { name: /facebook/i })).toHaveAttribute(
      "href",
      props.facebookUrl,
    );
    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
      "href",
      props.instagramUrl,
    );
  });
});
