"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { planData, PlanKey, videoSlots } from "@/data/plans";

const VIDEO_STORAGE_KEY = "glowUpVideos";
type VideoMap = Record<string, string>;

const defaultVideos = Object.fromEntries(
  videoSlots.map((slot) => [slot, ""])
) as VideoMap;

export default function SchedulePage() {
  const [planKey, setPlanKey] = useState<PlanKey>("jumpstart");
  const [videos, setVideos] = useState<VideoMap>(defaultVideos);
  const plan = planData[planKey];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(VIDEO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as VideoMap;
      setVideos({ ...defaultVideos, ...parsed });
    }
  }, []);

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
      <section className="animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-bright to-blue-bright bg-clip-text text-transparent">
          Weekly Quest Map 📅
        </h1>
        <p className="text-muted mt-2">Your path to leveling up. Switch modes anytime.</p>

        {/* Mode Toggle */}
        <div className="mt-6 flex gap-3 max-w-md">
          <button
            className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 ${
              planKey === "jumpstart"
                ? "bg-gradient-to-r from-pink to-purple text-ink shadow-glow scale-105"
                : "bg-purple-light/50 text-ink hover:bg-purple-light"
            }`}
            onClick={() => setPlanKey("jumpstart")}
          >
            ⚡ Jumpstart
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 ${
              planKey === "maintenance"
                ? "bg-gradient-to-r from-blue to-purple text-ink shadow-glow-blue scale-105"
                : "bg-blue-light/50 text-ink hover:bg-blue-light"
            }`}
            onClick={() => setPlanKey("maintenance")}
          >
            🌊 Chill Mode
          </button>
        </div>
      </section>

      {/* Weekly Grid */}
      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plan.week.map((item, index) => {
          const slots = item.videoSlots ?? [];
          const glowColor = (["pink", "purple", "blue", "yellow"] as const)[index % 4];
          const isRestDay = item.focus.toLowerCase().includes("rest");

          return (
            <Card
              key={`${item.day}-${item.focus}`}
              glow={glowColor}
              className={`animate-slide-up hover:scale-105 transition-transform duration-300 ${isRestDay ? "opacity-80" : ""}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${
                  index % 4 === 0 ? "text-pink-bright" :
                  index % 4 === 1 ? "text-purple-bright" :
                  index % 4 === 2 ? "text-blue-bright" : "text-yellow-bright"
                }`}>
                  {item.day}
                </p>
                {isRestDay && <span className="text-lg">😴</span>}
              </div>
              <CardTitle className="mt-2 text-lg">{item.focus}</CardTitle>
              <CardDescription>{item.detail}</CardDescription>

              {slots.length > 0 && (
                <div className="mt-4 rounded-xl bg-gradient-to-br from-purple-light/30 to-pink-light/30 px-3 py-3 text-xs space-y-2">
                  {slots.map((slot) => {
                    const value = videos[slot] ?? "";
                    const isLink = value.startsWith("http");
                    return (
                      <div key={slot} className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-muted font-medium">
                          {slot.replace(/^[^:]+:\s*/, "")}
                        </span>
                        {value ? (
                          isLink ? (
                            <a
                              href={value}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-purple-bright hover:text-pink-bright transition-colors inline-flex items-center gap-1"
                            >
                              ▶️ Play Video
                            </a>
                          ) : (
                            <span className="text-ink font-medium">{value}</span>
                          )
                        ) : (
                          <span className="text-muted/60 italic">Add in Tracker → Videos</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </section>

      {/* Legend */}
      <section className="mt-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <Card glow="purple" className="max-w-xl">
          <CardTitle>Legend</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink"></span>
              <span>Full Body / HIIT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple"></span>
              <span>Lower Body / Glutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue"></span>
              <span>Upper Body / Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow"></span>
              <span>Cardio / Skills</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
