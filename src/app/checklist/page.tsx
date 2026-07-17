"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getChecklistForDay, planData, PlanKey } from "@/data/plans";
import { useGame } from "@/lib/game-state";
import { playSound, playComboSound } from "@/lib/sounds";
import { triggerPopup } from "@/components/XPPopup";
import { cn } from "@/lib/utils";

const CHECKLIST_STORAGE_KEY = "glowUpChecklist";
const MODE_STORAGE_KEY = "glowUpMode";
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

type ChecklistMap = Record<number, boolean>;

const XP_PER_QUEST = 10;
const COINS_PER_QUEST = 5;

// Progress Ring Component
function ProgressRing({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
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

export default function ChecklistPage() {
  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checklist, setChecklist] = useState<ChecklistMap>({});
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [planKey, setPlanKey] = useState<PlanKey>("jumpstart");

  const {
    state,
    completeQuest,
    checkAchievements,
    enableSpin,
    resetCombo,
  } = useGame();

  // Get today's date info
  const today = new Date();
  const dayOfWeek = FULL_DAYS[today.getDay()];
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Load saved mode
  useEffect(() => {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === "jumpstart" || savedMode === "maintenance") {
      setPlanKey(savedMode);
    }
  }, []);

  // Get today's plan and determine if it's a rest day
  const todaysPlan = planData[planKey].week.find((d) => d.day === dayOfWeek);
  const isRestDay = todaysPlan?.focus.toLowerCase().includes("rest") ||
                    todaysPlan?.focus.toLowerCase().includes("reset") ||
                    dayOfWeek === "Sunday";

  // Get the appropriate checklist items for today
  const checklistItems = useMemo(() => getChecklistForDay(isRestDay), [isRestDay]);

  // Load checklist from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, ChecklistMap>;
      setChecklist(parsed[todayKey] ?? {});
    }
  }, [todayKey]);

  // Reset combo when leaving page or after inactivity
  useEffect(() => {
    const timeout = setTimeout(() => {
      resetCombo();
    }, 30000);

    return () => clearTimeout(timeout);
  }, [checklist, resetCombo]);

  const handleChecklistChange = (index: number, value: boolean) => {
    if (value && !checklist[index]) {
      setAnimatingIndex(index);
      playSound("complete", state.soundEnabled);

      const { leveledUp, isCritical, comboMultiplier } = completeQuest(XP_PER_QUEST, COINS_PER_QUEST);

      if (comboMultiplier > 1) {
        playComboSound(comboMultiplier, state.soundEnabled);
      }

      const xpGained = Math.floor(XP_PER_QUEST * (1 + (comboMultiplier - 1) * 0.1) * (isCritical ? 2 : 1));
      triggerPopup(`+${xpGained} XP`, isCritical ? "crit" : "xp");

      if (isCritical) {
        playSound("critical", state.soundEnabled);
        setTimeout(() => triggerPopup("CRITICAL!", "crit"), 200);
      }

      if (comboMultiplier > 1) {
        setTimeout(() => triggerPopup(`${comboMultiplier}x COMBO!`, "combo"), 100);
      }

      if (leveledUp) {
        playSound("levelUp", state.soundEnabled);
        setTimeout(() => triggerPopup(`LEVEL UP!`, "level"), 400);
      }

      setTimeout(() => {
        const newAchievements = checkAchievements();
        if (newAchievements.length > 0) {
          playSound("achievement", state.soundEnabled);
        }
      }, 500);

      setTimeout(() => {
        const nextChecklist = { ...checklist, [index]: value };
        setChecklist(nextChecklist);

        const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
        const parsed = stored ? (JSON.parse(stored) as Record<string, ChecklistMap>) : {};
        parsed[todayKey] = nextChecklist;
        window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(parsed));

        setAnimatingIndex(null);

        const completedCount = Object.values(nextChecklist).filter(Boolean).length;
        if (completedCount >= checklistItems.length * 0.5) {
          enableSpin();
        }
      }, 500);
    } else {
      const nextChecklist = { ...checklist, [index]: value };
      setChecklist(nextChecklist);

      const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as Record<string, ChecklistMap>) : {};
      parsed[todayKey] = nextChecklist;
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(parsed));
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalXP = completedCount * XP_PER_QUEST;
  const maxXP = checklistItems.length * XP_PER_QUEST;
  const progressPercent = (completedCount / checklistItems.length) * 100;

  const sortedItems = useMemo(() => {
    return checklistItems
      .map((item, index) => ({ item, index, completed: Boolean(checklist[index]) }))
      .sort((a, b) => {
        if (a.completed === b.completed) return a.index - b.index;
        return a.completed ? 1 : -1;
      });
  }, [checklist]);

  return (
    <div className="px-6 py-8 md:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <section className="animate-slide-up">
        <p className="text-zinc-400 text-sm">{formattedDate}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1 flex items-center gap-3">
          {isRestDay ? "Rest Day" : "Today's Quests"}
          <span className="text-2xl">{isRestDay ? "😴" : "💪"}</span>
        </h1>
        {isRestDay && (
          <p className="text-sm text-violet-600 mt-2">
            {todaysPlan?.detail || "Take it easy and recover!"}
          </p>
        )}
      </section>

      {/* Progress Overview */}
      <section className="mt-8 animate-slide-up delay-1">
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription>Daily Progress</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {completedCount} of {checklistItems.length} complete
              </CardTitle>
              <p className="text-sm text-zinc-500 mt-2">
                {progressPercent >= 100
                  ? "Perfect day! All habits done"
                  : progressPercent >= 50
                  ? "You're doing great, keep going!"
                  : "Let's get started!"}
              </p>
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-violet-500 font-semibold">{totalXP}/{maxXP}</span>
                  <span className="text-zinc-400">XP</span>
                </div>
                {state.currentCombo > 1 && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 rounded-lg">
                    <span className="text-amber-600 font-semibold">{state.currentCombo}x</span>
                    <span className="text-amber-500 text-xs">Combo</span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <ProgressRing progress={progressPercent} size={100} strokeWidth={8} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-zinc-900">{Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full opacity-50 blur-3xl" />
        </Card>
      </section>

      {/* Stats Row */}
      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "XP Today", value: totalXP, glow: "purple" as const },
          { label: "Streak", value: `${state.currentStreak}`, icon: "🔥", glow: "pink" as const },
          { label: "Coins", value: state.coins, icon: "🪙", glow: "yellow" as const },
          { label: "Level", value: state.level, icon: "⭐", glow: "blue" as const },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            glow={stat.glow}
            className={cn("text-center animate-slide-up", `delay-${i + 2}`)}
          >
            <p className="text-2xl font-bold text-zinc-900">
              {stat.icon ? `${stat.icon} ` : ""}{stat.value}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </section>

      {/* Checklist */}
      <section className="mt-8">
        <Card glow="purple" className="space-y-2 p-4">
          {sortedItems.map(({ item, index, completed }) => {
            const isAnimating = animatingIndex === index;

            return (
              <label
                key={`${item}-${index}`}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-4 cursor-pointer transition-all duration-300",
                  isAnimating && "animate-sink-down",
                  completed && !isAnimating
                    ? "bg-emerald-50/50 opacity-60"
                    : "bg-white hover:bg-zinc-50"
                )}
              >
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => handleChecklistChange(index, e.target.checked)}
                  className="sr-only"
                  disabled={isAnimating}
                />
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                    completed || isAnimating
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-zinc-200 bg-white hover:border-violet-300"
                  )}
                >
                  {(completed || isAnimating) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "flex-1 font-medium transition-all duration-300",
                    completed ? "line-through text-zinc-400" : "text-zinc-700"
                  )}
                >
                  {item}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium transition-all duration-300",
                    completed ? "text-emerald-500" : "text-zinc-300"
                  )}
                >
                  +{XP_PER_QUEST} XP
                </span>
              </label>
            );
          })}
        </Card>
      </section>

      {/* Boss Preview */}
      {state.weeklyBoss && !state.weeklyBoss.defeated && (
        <section className="mt-8 animate-slide-up delay-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Weekly Boss
                </span>
                <CardTitle className="mt-3">{state.weeklyBoss.name}</CardTitle>
                <CardDescription>Deal damage by completing habits</CardDescription>
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
        </section>
      )}

      {state.weeklyBoss?.defeated && (
        <section className="mt-8 animate-slide-up delay-4">
          <Card className="text-center bg-gradient-to-r from-amber-50 to-yellow-50">
            <span className="text-4xl">🏆</span>
            <CardTitle className="mt-2">Boss Defeated!</CardTitle>
            <CardDescription>You conquered {state.weeklyBoss.name} this week!</CardDescription>
          </Card>
        </section>
      )}

      {/* Motivation */}
      <section className="mt-8 animate-slide-up delay-5">
        <Card className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💬</span>
            <div>
              <CardTitle className="text-base">Coach Says</CardTitle>
              <CardDescription className="mt-1">
                {state.coach === "hype" && (
                  completedCount === 0
                    ? "LET'S GOOO! Time to crush some quests!"
                    : completedCount < checklistItems.length / 2
                    ? "You're on FIRE! Keep that energy UP!"
                    : completedCount < checklistItems.length
                    ? "UNSTOPPABLE! Just a few more to go!"
                    : "LEGENDARY PERFORMANCE! You're a BEAST!"
                )}
                {state.coach === "gentle" && (
                  completedCount === 0
                    ? "No pressure. Start with just one small quest."
                    : completedCount < checklistItems.length / 2
                    ? "You're doing wonderful. Every step counts."
                    : completedCount < checklistItems.length
                    ? "So proud of you. Take your time with the rest."
                    : "Beautiful work today. You earned this rest."
                )}
                {state.coach === "tough" && (
                  completedCount === 0
                    ? "Zero quests? Those goals won't achieve themselves. Get moving."
                    : completedCount < checklistItems.length / 2
                    ? "Decent start. But we're not here for decent. Push harder."
                    : completedCount < checklistItems.length
                    ? "Good progress. Now finish what you started. No excuses."
                    : "Acceptable. Tomorrow we go harder. Rest up."
                )}
                {state.coach === "chaos" && (
                  completedCount === 0
                    ? "Ooh a blank slate! So many checkboxes to click..."
                    : completedCount < checklistItems.length / 2
                    ? "More! MORE! The checkboxes hunger for clicks!"
                    : completedCount < checklistItems.length
                    ? "Almost there! The chaos demands completion!"
                    : "BEAUTIFUL CHAOS! All boxes checked! Spin the wheel!"
                )}
              </CardDescription>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
