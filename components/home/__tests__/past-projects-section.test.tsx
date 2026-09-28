import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PastProjectsSection } from "../past-projects-section";

describe("PastProjectsSection", () => {
  it("renders a card for each past project", () => {
    render(
      <PastProjectsSection
        events={[
          {
            _id: "1",
            title: "Aluth Kalawak — Melbourne Edition",
            slug: "aluth-kalawak-melbourne-edition",
            venue: "Trak Live Lounge Bar",
            startDate: "2023-10-13",
            status: "past",
          },
        ]}
      />,
    );
    expect(screen.getByText("Aluth Kalawak — Melbourne Edition")).toBeInTheDocument();
  });
});
