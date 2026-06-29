import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title:       "Zyflex AI – Intelligent Dispatch til Taxa og Flextrafik",
  description: "AI-drevet positionering, live hotspots og eventintelligens til taxaejere og flextrafik-operatører i Danmark.",
  keywords:    "taxa, flextrafik, AI dispatch, hotspot, Horsens, dansk taxi software",
  openGraph: {
    title:       "Zyflex AI – Smarter dispatch, færre tomkørsler",
    description: "Real-time AI-anbefalinger til taxaflåder. Kend hotspots før dine konkurrenter.",
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
