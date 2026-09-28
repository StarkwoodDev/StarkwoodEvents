import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UpcomingEventsSection } from "../upcoming-events-section";

describe("UpcomingEventsSection", () => {
  it("renders a card for each upcoming event", () => {
    render(
      <UpcomingEventsSection
        events={[
          {
            _id: "1",
            title: "Naadha Gama Melbourne 2026",
            slug: "naadha-gama-melbourne-2026",
            venue: "Sidney Myer Music Bowl",
            startDate: "2026-10-31",
            status: "upcoming",
          },
        ]}
      />,
    );
    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
  });

  it("shows the empty state when there are no upcoming events", () => {
    render(<UpcomingEventsSection events={[]} />);
    expect(screen.getByText("New events coming soon")).toBeInTheDocument();
  });
});
