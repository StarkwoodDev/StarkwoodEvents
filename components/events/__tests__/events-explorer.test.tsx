import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsExplorer } from "../events-explorer";
import type { EventSummary } from "@/lib/types";

const events: (EventSummary & { category?: string })[] = [
  { _id: "1", title: "Naadha Gama Melbourne 2026", slug: "naadha-gama", status: "upcoming", category: "Concert" },
  { _id: "2", title: "Home Lands Prestige Night", slug: "home-lands", status: "past", category: "Corporate" },
];

describe("EventsExplorer", () => {
  it("shows every event by default and filters when a category button is clicked", async () => {
    render(<EventsExplorer events={events} />);
    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
    expect(screen.getByText("Home Lands Prestige Night")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Concert" }));

    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
    expect(screen.queryByText("Home Lands Prestige Night")).not.toBeInTheDocument();
  });
});
