import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Byens Taxi · Chauffør",
  description: "Se hvor der er størst sandsynlighed for ture i Odense lige nu.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080c14",
};

export default function OdenseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
