import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatriXo | Make Math an Adventure",
  description:
    "MatriXo turns mathematics into an adventurous learning experience with dinosaurs, streaks, and rewarding challenges.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-ink">{children}</body>
    </html>
  );
}
