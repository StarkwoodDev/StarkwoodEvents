import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("renders the given message", () => {
    render(<EmptyState message="New events coming soon" />);
    expect(screen.getByText("New events coming soon")).toBeInTheDocument();
  });
});
