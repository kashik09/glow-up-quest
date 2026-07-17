"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useGame, PET_STAGES } from "@/lib/game-state";
import { planData, PlanKey, getChecklistForDay } from "@/data/plans";

const CHECKLIST_STORAGE_KEY = "glowUpChecklist";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MODE_STORAGE_KEY = "glowUpMode";

// Progress Ring Component
function ProgressRing({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        className="text-zinc-100"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-violet-500 progress-ring-circle"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}

// Get current week dates
function getCurrentWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOfWeek + i);
    dates.push(date);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function Home() {
  const { state, getXpProgress } = useGame();
  const { percent } = getXpProgress();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [planKey, setPlanKey] = useState<PlanKey>("jumpstart");
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Load saved mode
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === "jumpstart" || savedMode === "maintenance") {
      setPlanKey(savedMode);
    }

    // Load checklist progress
    const todayKey = new Date().toISOString().split("T")[0];
    const storedChecklist = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (storedChecklist) {
      try {
        const parsed = JSON.parse(storedChecklist) as Record<string, Record<number, boolean>>;
        const todayChecklist = parsed[todayKey] ?? {};
        const completed = Object.values(todayChecklist).filter(Boolean).length;
        setCompletedToday(completed);
      } catch {
        setCompletedToday(0);
      }
    }
  }, []);

  const handleModeChange = (mode: PlanKey) => {
    setPlanKey(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  };

  // Get today's info
  const today = new Date();
  const todayIndex = today.getDay();
  const todayName = FULL_DAYS[todayIndex];
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Get today's workout from plan
  const todaysPlan = planData[planKey].week.find((d) => d.day === todayName);
  const isRestDay = todaysPlan?.focus.toLowerCase().includes("rest");

  // Get current week dates for calendar
  const weekDates = getCurrentWeekDates();
  const activeDates = mounted ? (state.activeDates || []) : [];

  const petEmoji = state.pet ? PET_STAGES[state.pet.stage].emoji : "🥚";

  // Calculate today's quests dynamically based on day type
  const todayQuests = getChecklistForDay(isRestDay ?? false).length;
  const questProgress = todayQuests > 0 ? (completedToday / todayQuests) * 100 : 0;

  return (
    <div className="px-6 py-8 md:px-12 max-w-5xl mx-auto">
      {/* Header */}
      <section className="animate-slide-up">
        <p className="text-zinc-400 text-sm">{greeting}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1">
          Let&apos;s crush your goals
        </h1>
      </section>

      {/* Today's Progress */}
      <section className="mt-8 animate-slide-up delay-1">
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription>Today&apos;s Progress</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {completedToday} of {todayQuests} habits
              </CardTitle>
              <p className="text-sm text-zinc-500 mt-2">
                {questProgress >= 100
                  ? "Perfect day! All habits done"
                  : questProgress >= 50
                  ? "You're doing great, keep going!"
                  : "Let's get started!"}
              </p>
              <Link href="/checklist" className="inline-block mt-4">
                <Button>Continue</Button>
              </Link>
            </div>
            <div className="relative">
              <ProgressRing progress={questProgress} size={100} strokeWidth={8} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-zinc-900">{Math.round(questProgress)}%</span>
              </div>
            </div>
          </div>
          {/* Decorative gradient */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full opacity-50 blur-3xl" />
        </Card>
      </section>

      {/* Stats Grid */}
      <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Level", value: mounted ? state.level : 1, icon: "⭐", glow: "purple" as const },
          { label: "Streak", value: mounted ? state.currentStreak : 0, icon: "🔥", glow: "pink" as const },
          { label: "Coins", value: mounted ? state.coins : 0, icon: "🪙", glow: "yellow" as const },
          { label: "Total Done", value: mounted ? state.totalQuestsCompleted : 0, icon: "✓", glow: "blue" as const },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            glow={stat.glow}
            className={cn("animate-slide-up", `delay-${i + 2}`)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Weekly Calendar & Mode Toggle */}
      <section className="mt-6 grid md:grid-cols-2 gap-4">
        {/* Cute Weekly Calendar */}
        <Card glow="pink" className="animate-slide-up delay-2">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base">This Week</CardTitle>
            <span className="text-xs text-zinc-500">{formattedDate}</span>
          </div>
          <div className="flex justify-between gap-1">
            {weekDates.map((date, i) => {
              const dateKey = formatDateKey(date);
              const isToday = i === todayIndex;
              const isActive = activeDates.includes(dateKey);
              const isPast = date < today && !isToday;

              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 flex flex-col items-center py-2 rounded-xl transition-all",
                    isToday && "bg-gradient-to-b from-violet-500 to-pink-500 text-white shadow-lg",
                    !isToday && isActive && "bg-gradient-to-b from-emerald-100 to-emerald-50",
                    !isToday && !isActive && isPast && "bg-zinc-50 opacity-50"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-medium uppercase",
                    isToday ? "text-white/80" : "text-zinc-400"
                  )}>
                    {DAYS_OF_WEEK[i]}
                  </span>
                  <span className={cn(
                    "text-sm font-bold mt-1",
                    isToday ? "text-white" : "text-zinc-700"
                  )}>
                    {date.getDate()}
                  </span>
                  <span className="text-sm mt-1">
                    {isActive ? "✅" : isPast ? "·" : "○"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mode Toggle & Today's Workout */}
        <Card glow="purple" className="animate-slide-up delay-3">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-base">Today&apos;s Workout</CardTitle>
            <span className="text-2xl">{isRestDay ? "😴" : "💪"}</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                planKey === "jumpstart"
                  ? "bg-violet-500 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
              onClick={() => handleModeChange("jumpstart")}
            >
              🚀 Jumpstart
            </button>
            <button
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                planKey === "maintenance"
                  ? "bg-violet-500 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
              onClick={() => handleModeChange("maintenance")}
            >
              💪 Recomp
            </button>
          </div>

          {/* Today's Focus */}
          <div className="rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-3">
            <p className="font-semibold text-zinc-900">{todaysPlan?.focus || "Rest Day"}</p>
            <p className="text-xs text-zinc-500 mt-1">{todaysPlan?.detail || "Take it easy!"}</p>
          </div>

          <Link href="/schedule" className="inline-block mt-3">
            <Button variant="ghost" className="text-xs text-violet-600 hover:text-violet-700 p-0 h-auto">
              View full schedule →
            </Button>
          </Link>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="mt-8 grid md:grid-cols-2 gap-4">
        {/* Boss Card */}
        {state.weeklyBoss && !state.weeklyBoss.defeated && (
          <Card className="animate-slide-up delay-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Weekly Boss
                </span>
                <CardTitle className="mt-3">{state.weeklyBoss.name}</CardTitle>
                <CardDescription className="mt-1">
                  Deal damage by completing habits
                </CardDescription>
              </div>
              <span className="text-4xl">👾</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-zinc-500 mb-2">
                <span>HP</span>
                <span>{state.weeklyBoss.currentHp}/{state.weeklyBoss.maxHp}</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${(state.weeklyBoss.currentHp / state.weeklyBoss.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Pet Card */}
        <Card className="animate-slide-up delay-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
              <span className="text-3xl animate-float">{petEmoji}</span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">
                {state.pet ? state.pet.name : "Mystery Egg"}
              </CardTitle>
              <CardDescription>
                {state.pet
                  ? `Happiness: ${state.pet.happiness}%`
                  : "Reach Level 5 to hatch!"}
              </CardDescription>
              {state.pet && (
                <div className="mt-2 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                    style={{ width: `${state.pet.happiness}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Navigation Cards */}
      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/checklist", label: "Habits", icon: "✅", desc: "Daily tasks" },
          { href: "/shop", label: "Shop", icon: "🛍️", desc: "Rewards" },
          { href: "/tracker", label: "Progress", icon: "📊", desc: "Track stats" },
          { href: "/data", label: "Profile", icon: "👤", desc: "Settings" },
        ].map((item, i) => (
          <Link key={item.href} href={item.href}>
            <Card className={cn(
              "text-center cursor-pointer hover:-translate-y-1 animate-slide-up",
              `delay-${i + 4}`
            )}>
              <span className="text-3xl">{item.icon}</span>
              <p className="font-medium text-zinc-900 mt-2">{item.label}</p>
              <p className="text-xs text-zinc-400">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </section>

      {/* Tip Card */}
      <section className="mt-8 animate-slide-up delay-6">
        <Card className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <CardTitle className="text-base">Pro Tip</CardTitle>
              <CardDescription className="mt-1">
                {state.currentStreak === 0
                  ? "Start with just one habit today to build momentum."
                  : state.currentStreak < 7
                  ? `${7 - state.currentStreak} more days to unlock the Week Warrior badge!`
                  : "You're on fire! Keep the streak going."}
              </CardDescription>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
