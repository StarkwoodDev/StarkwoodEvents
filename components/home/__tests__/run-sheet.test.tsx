import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RunSheet } from "../run-sheet";

const events = [
  {
    _id: "1",
    title: "Naadha Gama Melbourne 2026",
    slug: "naadha-gama-melbourne-2026",
    venue: "Sidney Myer Music Bowl",
    startDate: "2026-10-31",
    status: "upcoming" as const,
    category: "Concert",
  },
  {
    _id: "2",
    title: "Aluth Kalawak — Melbourne Edition",
    slug: "aluth-kalawak-melbourne-edition",
    venue: "Trak Live Lounge Bar",
    startDate: "2023-10-13",
    status: "past" as const,
    category: "Concert",
  },
];

describe("RunSheet", () => {
  it("renders all events by default", () => {
    render(<RunSheet events={events} />);
    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
    expect(screen.getByText("Aluth Kalawak — Melbourne Edition")).toBeInTheDocument();
  });

  it("filters to only completed events when the Completed tab is selected", async () => {
    render(<RunSheet events={events} />);
    await userEvent.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.queryByText("Naadha Gama Melbourne 2026")).not.toBeInTheDocument();
    expect(screen.getByText("Aluth Kalawak — Melbourne Edition")).toBeInTheDocument();
  });

  it("shows an empty state when there are no events", () => {
    render(<RunSheet events={[]} />);
    expect(screen.getByText(/nothing here right now/i)).toBeInTheDocument();
  });
});
