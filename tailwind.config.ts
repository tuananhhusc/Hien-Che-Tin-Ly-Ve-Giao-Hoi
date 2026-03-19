import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#F4F1EA",
        offwhite: "#FAFAFA",
        ink: "#1A1A1A",
        royal: "#004F9E",
        purple: "#7D287D",
        gold: "#D4AF37",
        crimson: "#ED282C",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Merriweather", "serif"],
        body: ["var(--font-body)", "Source Serif 4", "serif"],
        ui: ["var(--font-ui)", "Inter", "sans-serif"],
      },
      typography: {
        catholic: {
          css: {
            "--tw-prose-body": "#1A1A1A",
            "--tw-prose-headings": "#111827",
            "--tw-prose-links": "#004F9E",
            "--tw-prose-bold": "#111827",
            "--tw-prose-counters": "#7D287D",
            "--tw-prose-bullets": "#D4AF37",
            "--tw-prose-hr": "#E5E7EB",
            "--tw-prose-quotes": "#1A1A1A",
            "--tw-prose-quote-borders": "#D4AF37",
            "--tw-prose-captions": "#4B5563",
            color: "#1A1A1A",
            lineHeight: "1.85",
            fontFamily: "var(--font-body), serif",
            h1: {
              fontFamily: "var(--font-heading), serif",
              fontWeight: "700",
              letterSpacing: "-0.01em",
              color: "#111827",
            },
            h2: {
              fontFamily: "var(--font-heading), serif",
              fontWeight: "700",
              marginTop: "2.5em",
              marginBottom: "1em",
              color: "#111827",
            },
            h3: {
              fontFamily: "var(--font-heading), serif",
              fontWeight: "600",
              marginTop: "2em",
              color: "#374151",
            },
            p: {
              marginTop: "1.5em",
              marginBottom: "1.5em",
            },
            a: {
              textDecorationColor: "#D4AF37",
              textUnderlineOffset: "4px",
              transition: "all .2s ease",
              fontWeight: "500",
            },
            "a:hover": {
              color: "#7D287D",
              textDecorationColor: "#7D287D",
            },
            hr: {
              borderColor: "#D4AF37",
              opacity: "0.3",
              margin: "3em 0",
            },
            blockquote: {
              fontStyle: "italic",
              borderLeftWidth: "3px",
              borderLeftColor: "#G4AF37",
              backgroundColor: "#F9F8F6",
              borderRadius: "0.25rem",
              padding: "1.5rem 2rem",
              margin: "2.5em 0",
              color: "#374151",
            },
            table: {
              width: "100%",
              marginTop: "2.5em",
              marginBottom: "2.5em",
              fontSize: "0.95em",
            },
            "thead th": {
              color: "#111827",
              borderBottomColor: "#D4AF37",
              fontWeight: "600",
              paddingBottom: "1em",
            },
            "tbody td": {
              borderBottomColor: "rgba(229, 231, 235, 0.5)",
              padding: "1em 0",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
