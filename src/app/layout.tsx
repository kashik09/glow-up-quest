import "./globals.css";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { GameWrapper } from "@/components/GameWrapper";

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
  title: "Glow Up Quest",
  description: "Level up your fitness journey. ADHD-friendly body recomp with tracking tools.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
        <GameWrapper>{children}</GameWrapper>
      </body>
    </html>
  );
}
