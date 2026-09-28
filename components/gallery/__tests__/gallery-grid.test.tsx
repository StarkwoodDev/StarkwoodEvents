import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GalleryGrid } from "../gallery-grid";

describe("GalleryGrid", () => {
  it("renders a heading and images for each group", () => {
    render(
      <GalleryGrid
        groups={[
          {
            title: "Aluth Kalawak — Melbourne Edition",
            slug: "aluth-kalawak-melbourne-edition",
            imageUrls: ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"],
          },
        ]}
      />,
    );
    expect(screen.getByText("Aluth Kalawak — Melbourne Edition")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("shows an empty state when there are no groups", () => {
    render(<GalleryGrid groups={[]} />);
    expect(screen.getByText(/photos coming soon/i)).toBeInTheDocument();
  });
});
