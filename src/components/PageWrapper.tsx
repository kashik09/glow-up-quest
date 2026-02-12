"use client";

import { ReactNode } from "react";

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden pb-24 md:pb-8">
      {/* Animated pastel blurred circles */}
      <div className="pointer-events-none fixed -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(249,168,212,0.4),transparent_70%)] animate-pulse-slow" />
      <div className="pointer-events-none fixed -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.35),transparent_70%)] animate-float" />
      <div className="pointer-events-none fixed -bottom-44 -left-44 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.3),transparent_70%)] animate-pulse-slow" />
      <div className="pointer-events-none fixed bottom-1/4 right-0 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.25),transparent_70%)] animate-float" />
      <div className="pointer-events-none fixed top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(249,168,212,0.2),transparent_70%)]" />

      {/* Content with fade-in animation */}
      <main className="relative z-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
