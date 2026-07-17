"use client";

import { ReactNode } from "react";
import { GameProvider } from "@/lib/game-state";
import { XPPopupContainer } from "@/components/XPPopup";
import { AchievementToastContainer } from "@/components/AchievementToast";
import { PlayerHUD } from "@/components/PlayerHUD";
import { Navigation } from "@/components/Navigation";
import { PageWrapper } from "@/components/PageWrapper";

function FloatingShapes() {
  return (
    <div className="floating-shapes">
      {/* Extra animated shapes - slow and subtle */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(196, 181, 253, 0.3), transparent 70%)",
          top: "40%",
          right: "20%",
          animation: "float-around 40s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute w-48 h-48 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(253, 224, 71, 0.3), transparent 70%)",
          bottom: "30%",
          left: "15%",
          animation: "float-around 35s ease-in-out infinite",
          animationDelay: "-10s",
        }}
      />
    </div>
  );
}

export function GameWrapper({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      {/* Background effects */}
      <FloatingShapes />

      {/* Popup systems */}
      <XPPopupContainer />
      <AchievementToastContainer />

      <div className="relative flex flex-col min-h-screen z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b-3 border-purple/20 px-4 py-3 shadow-md">
          <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
            <a
              href="/"
              className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-bright via-purple-bright to-blue-bright bg-clip-text text-transparent hover:scale-105 transition-transform shrink-0 arcade-text"
            >
              Glow Up Quest
            </a>
            <div className="flex-1 flex justify-center">
              <PlayerHUD />
            </div>
            <div className="hidden lg:block shrink-0">
              <Navigation />
            </div>
          </div>
        </header>

        {/* Main content */}
        <PageWrapper>{children}</PageWrapper>

        {/* Mobile navigation */}
        <div className="lg:hidden">
          <Navigation />
        </div>
      </div>
    </GameProvider>
  );
}
