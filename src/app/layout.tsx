import "./globals.css";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { PageWrapper } from "@/components/PageWrapper";

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
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-purple/10 px-6 py-4">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <a href="/" className="text-xl font-bold bg-gradient-to-r from-pink-bright via-purple-bright to-blue-bright bg-clip-text text-transparent hover:scale-105 transition-transform">
                Glow Up Quest ✨
              </a>
              <div className="hidden md:block">
                <Navigation />
              </div>
            </div>
          </header>
          <PageWrapper>
            {children}
          </PageWrapper>
          <div className="md:hidden">
            <Navigation />
          </div>
        </div>
      </body>
    </html>
  );
}
