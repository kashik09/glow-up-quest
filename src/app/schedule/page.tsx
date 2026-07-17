"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { planData, PlanKey, videoSlots, defaultVideoLinks } from "@/data/plans";
import { cn } from "@/lib/utils";

const VIDEO_STORAGE_KEY = "glowUpVideos";
type VideoMap = Record<string, string>;

const defaultVideos = Object.fromEntries(
  videoSlots.map((slot) => [slot, defaultVideoLinks[slot] || ""])
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

  const glowColors = ["purple", "pink", "blue", "yellow"] as const;

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
      {/* Header */}
      <section className="animate-slide-up">
        <p className="text-zinc-400 text-sm">Weekly plan</p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1">
          Weekly Schedule
        </h1>

        {/* Mode Toggle */}
        <div className="mt-6 flex gap-3 max-w-md">
          <button
            className={cn(
              "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              planKey === "jumpstart"
                ? "bg-violet-500 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]"
                : "bg-white text-zinc-600 hover:bg-zinc-50"
            )}
            onClick={() => setPlanKey("jumpstart")}
          >
            Jumpstart
          </button>
          <button
            className={cn(
              "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              planKey === "maintenance"
                ? "bg-violet-500 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]"
                : "bg-white text-zinc-600 hover:bg-zinc-50"
            )}
            onClick={() => setPlanKey("maintenance")}
          >
            Recomp
          </button>
        </div>
      </section>

      {/* Weekly Grid */}
      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plan.week.map((item, index) => {
          const slots = item.videoSlots ?? [];
          const glow = glowColors[index % 4];
          const isRestDay = item.focus.toLowerCase().includes("rest");

          return (
            <Card
              key={`${item.day}-${item.focus}`}
              glow={glow}
              className={cn(
                "animate-slide-up hover:scale-[1.02] transition-transform duration-200",
                isRestDay && "opacity-70"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  {item.day}
                </p>
                {isRestDay && <span className="text-lg">😴</span>}
              </div>
              <CardTitle className="mt-2 text-base">{item.focus}</CardTitle>
              <CardDescription className="text-sm">{item.detail}</CardDescription>

              {slots.length > 0 && (
                <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-3 text-xs space-y-2">
                  {slots.map((slot) => {
                    const value = videos[slot] ?? "";
                    const isLink = value.startsWith("http");
                    return (
                      <div key={slot} className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-zinc-400 font-medium">
                          {slot.replace(/^[^:]+:\s*/, "")}
                        </span>
                        {value ? (
                          isLink ? (
                            <div className="flex flex-wrap items-center gap-3">
                              <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-violet-600 hover:text-violet-700 transition-colors inline-flex items-center gap-1"
                              >
                                <span className="text-sm">▶</span> Open Link
                              </a>
                              <Link
                                href="/tracker?tab=videos"
                                className="font-medium text-zinc-500 hover:text-zinc-700 transition-colors inline-flex items-center gap-1"
                              >
                                <span className="text-sm">🎬</span> Watch In-App
                              </Link>
                            </div>
                          ) : (
                            <span className="text-zinc-700 font-medium">{value}</span>
                          )
                        ) : (
                          <span className="text-zinc-400 italic">Add in Tracker → Videos</span>
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
      <section className="mt-8 animate-slide-up delay-4">
        <Card className="max-w-xl">
          <CardTitle className="text-base">Legend</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-400"></span>
              <span>Full Body / HIIT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-400"></span>
              <span>Lower Body / Glutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400"></span>
              <span>Upper Body / Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span>Cardio / Skills</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
