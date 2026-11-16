import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatrixSaur | Make Math an Adventure",
  description:
    "MatriSaur turns mathematics into an adventurous learning experience with dinosaurs, streaks, and rewarding challenges.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-ink">
        <NextTopLoader color="#1f5740" showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
