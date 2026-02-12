import "./globals.css";
import { Fraunces, Space_Grotesk } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Kashi Recomp Routine",
  description: "A clear, ADHD-friendly body recomp routine with tracking tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
