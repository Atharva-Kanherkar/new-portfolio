import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Atharva — Fullstack Developer",
  description:
    "Crafting intelligent systems. Fullstack developer building at the intersection of AI, infrastructure, and creative interfaces.",
  openGraph: {
    title: "Atharva — Fullstack Developer",
    description: "Crafting intelligent systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
