import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zyflex · Ejer-dashboard",
  description: "Overblik over chauffører, aktivitet og taxameter-analyse",
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
