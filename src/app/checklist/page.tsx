"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { checklistItems } from "@/data/plans";

const CHECKLIST_STORAGE_KEY = "glowUpChecklist";
type ChecklistMap = Record<number, boolean>;

export default function ChecklistPage() {
  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checklist, setChecklist] = useState<ChecklistMap>({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, ChecklistMap>;
      setChecklist(parsed[todayKey] ?? {});

      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = checkDate.toISOString().split("T")[0];
        const dayChecklist = parsed[dateKey];
        if (dayChecklist) {
          const completed = Object.values(dayChecklist).filter(Boolean).length;
          if (completed >= checklistItems.length * 0.5) {
            currentStreak++;
          } else if (i > 0) {
            break;
          }
        } else if (i > 0) {
          break;
        }
      }
      setStreak(currentStreak);
    }
  }, [todayKey]);

  const handleChecklistChange = (index: number, value: boolean) => {
    const nextChecklist = { ...checklist, [index]: value };
    setChecklist(nextChecklist);
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Record<string, ChecklistMap>) : {};
    parsed[todayKey] = nextChecklist;
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(parsed));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalXP = completedCount * 10;
  const maxXP = checklistItems.length * 10;
  const progressPercent = (completedCount / checklistItems.length) * 100;

  return (
    <div className="px-6 py-8 md:px-12 max-w-4xl mx-auto">
      <section className="animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-bright to-pink-bright bg-clip-text text-transparent">
          Daily Quests ✅
        </h1>
        <p className="text-muted mt-2">Complete quests to level up. Progress saved daily.</p>
      </section>

      {/* Stats Row */}
      <section className="mt-8 grid grid-cols-3 gap-4">
        <Card glow="pink" className="text-center animate-bounce-in">
          <p className="text-3xl font-bold text-pink-bright">{totalXP}</p>
          <p className="text-xs text-muted uppercase tracking-wide">XP Today</p>
        </Card>
        <Card glow="purple" className="text-center animate-bounce-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-3xl font-bold text-purple-bright">{completedCount}/{checklistItems.length}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Quests</p>
        </Card>
        <Card glow="yellow" className="text-center animate-bounce-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-3xl font-bold text-yellow-bright">{streak}🔥</p>
          <p className="text-xs text-muted uppercase tracking-wide">Streak</p>
        </Card>
      </section>

      {/* XP Progress Bar */}
      <section className="mt-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <Card glow="purple">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-purple-bright">Today&apos;s Progress</span>
            <span className="text-sm font-bold text-pink-bright">{totalXP} / {maxXP} XP</span>
          </div>
          <div className="h-4 bg-purple-light/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink via-purple to-blue rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent === 100 && (
            <p className="text-center text-sm font-bold text-pink-bright mt-2 animate-bounce-in">
              🎉 PERFECT DAY! All quests completed!
            </p>
          )}
        </Card>
      </section>

      {/* Checklist */}
      <section className="mt-8">
        <Card glow="purple" className="space-y-3">
          {checklistItems.map((item, index) => {
            const colors = ["pink", "purple", "blue", "yellow"] as const;
            const color = colors[index % 4];
            const isChecked = Boolean(checklist[index]);

            return (
              <label
                key={item}
                className={`flex items-center gap-4 rounded-xl border-2 px-4 py-4 cursor-pointer transition-all duration-300 animate-slide-up ${
                  isChecked
                    ? `bg-gradient-to-r from-${color}-light/50 to-white border-${color}/40 scale-[0.98]`
                    : "bg-white/50 border-purple/10 hover:border-purple/30 hover:scale-[1.01]"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleChecklistChange(index, e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  isChecked
                    ? `bg-gradient-to-br from-${color} to-${color}-bright border-${color}-bright`
                    : "border-purple/30 bg-white"
                }`}>
                  {isChecked && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`flex-1 font-medium transition-all duration-300 ${
                  isChecked ? "line-through text-muted" : "text-ink"
                }`}>
                  {item}
                </span>
                <span className={`text-sm font-bold transition-all duration-300 ${
                  isChecked ? `text-${color}-bright` : "text-muted/50"
                }`}>
                  +10 XP
                </span>
              </label>
            );
          })}
        </Card>
      </section>

      {/* Motivation */}
      <section className="mt-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <Card glow="yellow">
          <CardTitle>💪 Keep Going!</CardTitle>
          <CardDescription className="mt-2">
            {completedCount === 0
              ? "Start your day strong! Check off your first quest."
              : completedCount < checklistItems.length / 2
              ? "You're warming up! Keep that momentum going."
              : completedCount < checklistItems.length
              ? "Almost there! Just a few more quests to crush."
              : "LEGENDARY! You completed all quests today! 🏆"}
          </CardDescription>
        </Card>
      </section>
    </div>
  );
}
