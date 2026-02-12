"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { planData, PlanKey } from "@/data/plans";

export default function Home() {
  const [planKey, setPlanKey] = useState<PlanKey>("jumpstart");
  const plan = planData[planKey];

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="animate-slide-up">
        <p className="text-xs font-bold uppercase tracking-[0.25em] bg-gradient-to-r from-pink-bright to-purple-bright bg-clip-text text-transparent">
          Level Up · No Equipment · Indoor Quest
        </p>
        <h1 className="mt-3 text-4xl md:text-6xl font-bold bg-gradient-to-r from-ink via-purple-bright to-pink-bright bg-clip-text text-transparent leading-tight">
          Your glow up starts here.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          A clear, ADHD-friendly quest that starts at your level, keeps you consistent, and
          protects your energy. Adjust the details, never restart the game.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/schedule">
            <Button variant="pink" className="animate-bounce-in">
              See the Week
            </Button>
          </Link>
          <Link href="/checklist">
            <Button variant="ghost" className="animate-bounce-in" style={{ animationDelay: "0.1s" }}>
              Daily Quests
            </Button>
          </Link>
          <Link href="/tracker">
            <Button variant="purple" className="animate-bounce-in" style={{ animationDelay: "0.2s" }}>
              Track Progress
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mt-12 grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Workouts/Week", value: "6", color: "pink" },
          { label: "Rest Days", value: "1", color: "purple" },
          { label: "Minutes/Day", value: "20-30", color: "blue" },
          { label: "Equipment", value: "None", color: "yellow" },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            glow={stat.color as "pink" | "purple" | "blue" | "yellow"}
            className="text-center animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <p className={`text-3xl font-bold ${
              stat.color === "pink" ? "text-pink-bright" :
              stat.color === "purple" ? "text-purple-bright" :
              stat.color === "blue" ? "text-blue-bright" : "text-yellow-bright"
            }`}>
              {stat.value}
            </p>
            <p className="text-xs text-muted font-medium uppercase tracking-wide mt-1">
              {stat.label}
            </p>
          </Card>
        ))}
      </section>

      {/* Today's Quest Card */}
      <section className="mt-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <Card glow="pink" className="bg-white/80 backdrop-blur-lg max-w-2xl">
          <CardTitle className="text-2xl">Today&apos;s Quest</CardTitle>
          <CardDescription>Choose your difficulty level.</CardDescription>

          <div className="mt-6 flex gap-3">
            <button
              className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 ${
                planKey === "jumpstart"
                  ? "bg-gradient-to-r from-pink to-purple text-ink shadow-glow scale-105"
                  : "bg-purple-light/50 text-ink hover:bg-purple-light hover:scale-102"
              }`}
              onClick={() => setPlanKey("jumpstart")}
            >
              ⚡ Jumpstart Mode
            </button>
            <button
              className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 ${
                planKey === "maintenance"
                  ? "bg-gradient-to-r from-blue to-purple text-ink shadow-glow-blue scale-105"
                  : "bg-blue-light/50 text-ink hover:bg-blue-light hover:scale-102"
              }`}
              onClick={() => setPlanKey("maintenance")}
            >
              🌊 Chill Mode
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-pink-light/50 to-purple-light/50 p-5 border border-purple/20">
            <h3 className="text-xl font-bold text-purple-bright">{plan.title}</h3>
            <p className="text-sm text-muted mt-1">{plan.description}</p>
            <ul className="mt-4 grid gap-2">
              {plan.pills.map((pill, i) => (
                <li
                  key={pill}
                  className={`rounded-full px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                    i === 0
                      ? "bg-pink-light/70 text-pink-bright"
                      : i === 1
                      ? "bg-purple-light/70 text-purple-bright"
                      : "bg-blue-light/70 text-blue-bright"
                  }`}
                >
                  <span>{i === 0 ? "💪" : i === 1 ? "🥗" : "🍉"}</span>
                  {pill}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <Link href="/schedule">
              <Button variant="purple" className="w-full">
                View Full Schedule →
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Quick Links */}
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          { href: "/routine", title: "Daily Routine", desc: "Your power-up schedule", emoji: "⚡", color: "pink" },
          { href: "/tracker", title: "Progress Tracker", desc: "Photos, meals & videos", emoji: "📊", color: "purple" },
          { href: "/checklist", title: "Daily Quests", desc: "Track your XP", emoji: "✅", color: "blue" },
        ].map((link, i) => (
          <Link key={link.href} href={link.href}>
            <Card
              glow={link.color as "pink" | "purple" | "blue"}
              className="h-full hover:scale-105 transition-transform duration-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <span className="text-4xl">{link.emoji}</span>
              <CardTitle className="mt-3">{link.title}</CardTitle>
              <CardDescription>{link.desc}</CardDescription>
            </Card>
          </Link>
        ))}
      </section>

      {/* Boss Battle Tips */}
      <section className="mt-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <Card glow="yellow">
          <CardTitle className="text-xl">Boss Battle Tips 🎮</CardTitle>
          <CardDescription className="mb-4">No game overs. Just respawn and keep going.</CardDescription>
          <ul className="grid gap-3 text-sm">
            {[
              { tip: "Too hard? Do the easier version or fewer reps.", color: "pink" },
              { tip: "Too tired? Pause the video for 30–60 seconds.", color: "purple" },
              { tip: "Sharp pain? Stop and rest. Muscle burn is normal.", color: "blue" },
              { tip: "Missed a day? Continue the next day. No guilt.", color: "yellow" },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`w-6 h-6 rounded-full bg-${item.color}-light flex items-center justify-center text-${item.color}-bright font-bold text-xs shrink-0`}>
                  {i + 1}
                </span>
                <span>{item.tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
