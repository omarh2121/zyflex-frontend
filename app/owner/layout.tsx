import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Byens Taxi · Ejer",
  description: "Overblik over chauffører, aktivitet og taxameter-analyse",
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
