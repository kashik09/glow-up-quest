"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { planData, PlanKey } from "@/data/plans";
import { cn } from "@/lib/utils";

const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MODE_STORAGE_KEY = "glowUpMode";

type RoutineItem = {
  id: string;
  time: string;
  title: string;
  note: string;
  emoji: string;
  xp: number;
};

type DailyProgressStore = {
  date: string;
  completedIds: string[];
  bossDone: boolean;
};

type StreakStore = {
  streak: number;
  lastCompletedDate: string | null;
};

type ConfettiPiece = {
  id: number;
  left: number;
  duration: number;
  color: string;
};

const DAILY_XP_GOAL = 200;
const DAILY_PROGRESS_KEY = "routine-daily-progress-v1";
const STREAK_KEY = "routine-streak-v1";

// Workout day routine items
const workoutDayItems: RoutineItem[] = [
  { id: "wake-water", time: "5:45", title: "Wake up + water", note: "Bathroom, a few sips of water.", emoji: "🌅", xp: 10 },
  { id: "chia-pudding", time: "6:00", title: "Chia pudding", note: "Keep honey light; add protein if you can.", emoji: "🥣", xp: 15 },
  { id: "watermelon-juice", time: "6:15", title: "Watermelon juice", note: "8 oz blended, with a meal if possible.", emoji: "🍉", xp: 10 },
  { id: "warm-up", time: "6:30", title: "Warm-up", note: "5 min, protect your joints.", emoji: "🔥", xp: 10 },
  { id: "main-workout", time: "6:35", title: "Main workout", note: "15–25 min. Pause and modify freely.", emoji: "💪", xp: 25 },
  { id: "cool-down", time: "6:55", title: "Cool-down stretch", note: "12 min. Reduces soreness.", emoji: "🧘", xp: 15 },
  { id: "breakfast", time: "7:30", title: "Breakfast", note: "Eggs + protein + veggies.", emoji: "🍳", xp: 15 },
  { id: "lunch", time: "12:00", title: "Lunch", note: "Protein + fist-sized carbs + veggies.", emoji: "🥗", xp: 15 },
  { id: "dinner", time: "18:00", title: "Dinner", note: "Protein + veggies + smaller carb portion.", emoji: "🍽️", xp: 15 },
  { id: "wind-down", time: "20:00", title: "Wind down", note: "Prep clothes + chia for tomorrow.", emoji: "🌙", xp: 20 },
];

// Rest day routine items
const restDayItems: RoutineItem[] = [
  { id: "wake-water", time: "7:00", title: "Wake up + water", note: "Sleep in a bit, then hydrate.", emoji: "🌅", xp: 10 },
  { id: "chia-pudding", time: "7:30", title: "Chia pudding", note: "Relaxed morning fuel.", emoji: "🥣", xp: 15 },
  { id: "watermelon-juice", time: "8:00", title: "Watermelon juice", note: "8 oz blended, enjoy slowly.", emoji: "🍉", xp: 10 },
  { id: "gentle-stretch", time: "9:00", title: "Gentle stretch", note: "15 min. Light mobility only.", emoji: "🧘", xp: 15 },
  { id: "self-care", time: "10:00", title: "Self-care moment", note: "Skincare, journaling, or just chill.", emoji: "✨", xp: 20 },
  { id: "breakfast", time: "8:30", title: "Brunch", note: "Enjoy a relaxed meal.", emoji: "🍳", xp: 15 },
  { id: "lunch", time: "13:00", title: "Lunch", note: "Balanced plate, no rush.", emoji: "🥗", xp: 15 },
  { id: "dinner", time: "18:00", title: "Dinner", note: "Light and nourishing.", emoji: "🍽️", xp: 15 },
  { id: "prep-week", time: "19:00", title: "Prep for the week", note: "Plan workouts, prep meals.", emoji: "📋", xp: 20 },
  { id: "wind-down", time: "20:00", title: "Wind down", note: "Early rest for Monday energy.", emoji: "🌙", xp: 20 },
];

// Legacy export for compatibility
const routineItems = workoutDayItems;

const bossFight: RoutineItem = {
  id: "boss-fight",
  time: "21:00",
  title: "Boss Fight: Zero-Scroll Shutdown",
  note: "No social scroll 30 minutes before sleep. Phone away, mind down.",
  emoji: "👾",
  xp: 50,
};

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayKey(yesterday);
}

function getRank(totalXp: number) {
  if (totalXp >= 160) return "Legend";
  if (totalXp >= 90) return "Warrior";
  return "Rookie";
}

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

export default function RoutinePage() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [bossDone, setBossDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [planKey, setPlanKey] = useState<PlanKey>("jumpstart");
  const [mounted, setMounted] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const confettiId = useRef(0);

  // Get today's info (only on client)
  const today = new Date();
  const dayOfWeek = FULL_DAYS[today.getDay()];
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Load saved mode and mark as mounted
  useEffect(() => {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === "jumpstart" || savedMode === "maintenance") {
      setPlanKey(savedMode);
    }
    setMounted(true);
  }, []);

  // Get today's plan and determine if it's a rest day
  const todaysPlan = planData[planKey].week.find((d) => d.day === dayOfWeek);
  const isRestDay = mounted && (
    todaysPlan?.focus.toLowerCase().includes("rest") ||
    todaysPlan?.focus.toLowerCase().includes("reset") ||
    dayOfWeek === "Sunday"
  );

  // Use appropriate items based on day type
  const currentRoutineItems = isRestDay ? restDayItems : workoutDayItems;

  const totalXp = useMemo(() => {
    const routineXp = currentRoutineItems.reduce((sum, item) => {
      return completedIds.includes(item.id) ? sum + item.xp : sum;
    }, 0);
    return routineXp + (bossDone ? bossFight.xp : 0);
  }, [completedIds, bossDone, currentRoutineItems]);

  const progressPercent = Math.min(100, Math.round((totalXp / DAILY_XP_GOAL) * 100));
  const rank = getRank(totalXp);
  const allDone = completedIds.length === currentRoutineItems.length && bossDone;

  useEffect(() => {
    const today = getTodayKey();

    const storedDailyRaw = localStorage.getItem(DAILY_PROGRESS_KEY);
    if (storedDailyRaw) {
      try {
        const storedDaily = JSON.parse(storedDailyRaw) as DailyProgressStore;
        if (storedDaily.date === today) {
          setCompletedIds(storedDaily.completedIds || []);
          setBossDone(Boolean(storedDaily.bossDone));
        }
        // If date doesn't match, we keep state empty (new day)
      } catch {
        // Parse error - start fresh
      }
    }

    const storedStreakRaw = localStorage.getItem(STREAK_KEY);
    if (storedStreakRaw) {
      try {
        const storedStreak = JSON.parse(storedStreakRaw) as StreakStore;
        setStreak(storedStreak.streak || 0);
      } catch {
        setStreak(0);
      }
    }

    // Mark loading complete - this triggers save effect with correct data
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Don't save until we've loaded existing data
    if (isLoading) return;

    const payload: DailyProgressStore = {
      date: getTodayKey(),
      completedIds,
      bossDone,
    };

    localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(payload));

    // Show save indicator
    setSaveIndicator(true);
    const timeout = setTimeout(() => setSaveIndicator(false), 1500);
    return () => clearTimeout(timeout);
  }, [completedIds, bossDone, isLoading]);

  useEffect(() => {
    if (isLoading || !allDone) return;

    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const storedStreakRaw = localStorage.getItem(STREAK_KEY);

    let current: StreakStore = { streak: 0, lastCompletedDate: null };
    if (storedStreakRaw) {
      try {
        current = JSON.parse(storedStreakRaw) as StreakStore;
      } catch {
        current = { streak: 0, lastCompletedDate: null };
      }
    }

    if (current.lastCompletedDate === today) return;

    const nextStreak = current.lastCompletedDate === yesterday ? current.streak + 1 : 1;
    const updated: StreakStore = {
      streak: nextStreak,
      lastCompletedDate: today,
    };

    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    setStreak(nextStreak);
  }, [allDone, isLoading]);

  const playCompletionSound = () => {
    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;

      const audio = new AudioContextConstructor();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const now = audio.currentTime;

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.14);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.22);
      oscillator.onended = () => {
        void audio.close();
      };
    } catch {
      // Audio feedback is optional.
    }
  };

  const triggerCelebration = () => {
    playCompletionSound();

    const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];
    const pieces = Array.from({ length: 18 }, () => {
      confettiId.current += 1;
      return {
        id: confettiId.current,
        left: 8 + Math.random() * 84,
        duration: 800 + Math.floor(Math.random() * 500),
        color: colors[Math.floor(Math.random() * colors.length)],
      } satisfies ConfettiPiece;
    });

    setConfetti((prev) => [...prev, ...pieces]);

    const ids = new Set(pieces.map((piece) => piece.id));
    window.setTimeout(() => {
      setConfetti((prev) => prev.filter((piece) => !ids.has(piece.id)));
    }, 1400);
  };

  const toggleQuest = (id: string) => {
    setCompletedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      triggerCelebration();
      return [...prev, id];
    });
  };

  const toggleBossFight = () => {
    setBossDone((prev) => {
      const next = !prev;
      if (next) triggerCelebration();
      return next;
    });
  };

  return (
    <div className="px-6 py-8 md:px-12 max-w-4xl mx-auto">
      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="absolute h-2 w-2 rounded-sm"
            style={
              {
                left: `${piece.left}%`,
                top: "12%",
                backgroundColor: piece.color,
                animation: `confettiFall ${piece.duration}ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
              } satisfies CSSProperties
            }
          />
        ))}
      </div>

      {/* Header */}
      <section className="animate-slide-up">
        <div className="flex items-center justify-between">
          <p className="text-zinc-400 text-sm">{formattedDate}</p>
          {saveIndicator && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full animate-fade-in flex items-center gap-1">
              ✓ Saved
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1 flex items-center gap-3">
          {isRestDay ? "Rest Day Routine" : "Daily Routine"}
          <span className="text-2xl">{isRestDay ? "😴" : "💪"}</span>
        </h1>
        {isRestDay && (
          <p className="text-sm text-violet-600 mt-2">
            {todaysPlan?.detail || "Take it easy and recover!"}
          </p>
        )}
      </section>

      {/* Player HUD */}
      <section className="mt-8 animate-slide-up delay-1">
        <Card glow="blue" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl">Daily Progress</CardTitle>
                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                  {rank}
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                {totalXp} / {DAILY_XP_GOAL} XP
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Streak: {streak} day{streak === 1 ? "" : "s"}
              </p>
            </div>
            <div className="relative">
              <ProgressRing progress={progressPercent} size={80} strokeWidth={6} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-zinc-900">{progressPercent}%</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full opacity-50 blur-3xl" />
        </Card>
      </section>

      {/* Timeline */}
      <section className="mt-8 relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-pink-200 to-emerald-200 hidden md:block" />

        <div className="space-y-4">
          {currentRoutineItems.map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 items-start animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Time bubble */}
              <div className="hidden md:flex w-16 h-16 rounded-full items-center justify-center text-2xl shrink-0 z-10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                {item.emoji}
              </div>

              {/* Card */}
              <Card
                className={cn(
                  "flex-1 hover:scale-[1.01] transition-transform duration-200",
                  completedIds.includes(item.id) && "ring-2 ring-emerald-200 bg-emerald-50/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="md:hidden text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-semibold text-zinc-600">
                        {item.time}
                      </span>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                        +{item.xp} XP
                      </span>
                    </div>
                    <CardDescription className="mt-1">{item.note}</CardDescription>

                    <div className="mt-3">
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={completedIds.includes(item.id)}
                          onChange={() => toggleQuest(item.id)}
                          className="sr-only"
                          aria-label={`Mark ${item.title} done`}
                        />
                        <div className={cn(
                          "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                          completedIds.includes(item.id)
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-zinc-200 hover:border-violet-300"
                        )}>
                          {completedIds.includes(item.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{completedIds.includes(item.id) ? "Done" : "Mark done"}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Boss Fight */}
      <section className="mt-10 animate-slide-up delay-5">
        <Card className={cn(
          "relative overflow-hidden",
          bossDone && "ring-2 ring-amber-200"
        )}>
          <div className="flex items-start gap-3">
            <div className="hidden md:flex w-16 h-16 rounded-full items-center justify-center text-2xl shrink-0 bg-amber-50">
              {bossFight.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="md:hidden text-2xl">{bossFight.emoji}</span>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Boss Fight
                </span>
                <span className="text-lg font-semibold text-zinc-600">{bossFight.time}</span>
              </div>
              <CardTitle className="text-base mt-2">{bossFight.title}</CardTitle>
              <CardDescription className="mt-1">{bossFight.note}</CardDescription>
              <div className="flex items-center gap-4 mt-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bossDone}
                    onChange={toggleBossFight}
                    className="sr-only"
                    aria-label="Mark boss fight done"
                  />
                  <div className={cn(
                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                    bossDone
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-zinc-200 hover:border-violet-300"
                  )}>
                    {bossDone && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>{bossDone ? "Boss defeated" : "Defeat boss"}</span>
                </label>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  +{bossFight.xp} XP
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-50 blur-3xl" />
        </Card>
      </section>

      {/* Tips */}
      <section className="mt-8 animate-slide-up delay-6">
        <Card className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <CardTitle className="text-base">Pro Tips</CardTitle>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                <li>Lay out workout clothes the night before - no decision fatigue</li>
                <li>Pre-make chia pudding before bed so it&apos;s ready to eat</li>
                <li>Set phone alarms for each time slot until it becomes habit</li>
                <li>Times are flexible - adjust based on your schedule</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
