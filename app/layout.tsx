import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title:       "Byens Taxi",
  description: "Beslutningsværktøj til taxachauffører og vognmænd — zoner, events og taxameter-analyse.",
  keywords:    "taxa, Byens Taxi, Horsens, chauffør, vognmand, zoner",
  openGraph: {
    title:       "Byens Taxi",
    description: "Vid hvor turen er, før den sker — zoner, events og indtjening.",
    type:        "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
