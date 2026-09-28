import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "../event-card";

describe("EventCard", () => {
  it("renders title, venue, and formatted date, linking to the event page", () => {
    render(
      <EventCard
        title="Naadha Gama Melbourne 2026"
        slug="naadha-gama-melbourne-2026"
        venue="Sidney Myer Music Bowl"
        startDate="2026-10-31"
        summary="A new chapter for Sri Lankan music in Australia."
      />,
    );
    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
    expect(screen.getByText("Sidney Myer Music Bowl")).toBeInTheDocument();
    expect(screen.getByText("31 October 2026")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/events/naadha-gama-melbourne-2026",
    );
  });

  it("shows a branded placeholder when there is no cover image", () => {
    render(
      <EventCard
        title="Untitled Event"
        slug="untitled-event"
        venue="TBC"
        startDate={undefined}
      />,
    );
    expect(screen.getByTestId("event-card-placeholder")).toBeInTheDocument();
  });
});
