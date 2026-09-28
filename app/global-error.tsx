"use client";

import { useEffect } from "react";
import { DEFAULT_EMAIL, DEFAULT_PHONE } from "@/lib/site-config";

// Replaces the root layout when it fails, so globals.css and fonts are not
// loaded here — styles are inline and self-contained on purpose.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[app] root layout error", error.digest ?? "", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080a",
          color: "#f5f5f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        <title>Starkwood Events</title>
        <main style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>Starkwood Events</h1>
          <p style={{ color: "#a1a1a1", lineHeight: 1.6 }}>
            We&apos;re having trouble loading the site right now. Please try again in a moment,
            or contact us on{" "}
            <a href={`tel:${DEFAULT_PHONE.replace(/\s/g, "")}`} style={{ color: "#e5a244" }}>
              {DEFAULT_PHONE}
            </a>{" "}
            or{" "}
            <a href={`mailto:${DEFAULT_EMAIL}`} style={{ color: "#e5a244" }}>
              {DEFAULT_EMAIL}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              border: 0,
              borderRadius: 8,
              background: "#c58b38",
              color: "#08080a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: 24, fontSize: 12, color: "#6b6b6b" }}>Ref: {error.digest}</p>
          )}
        </main>
      </body>
    </html>
  );
}
