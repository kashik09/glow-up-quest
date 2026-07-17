"use client";

import { useEffect, useState } from "react";
import { useGame, PET_STAGES } from "@/lib/game-state";
import { cn } from "@/lib/utils";

export function PlayerHUD() {
  const { state, getXpProgress, getAvatarMood } = useGame();
  const { percent } = getXpProgress();
  const mood = getAvatarMood();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const moodEmoji = {
    tired: "😴",
    okay: "🙂",
    good: "😊",
    great: "😄",
    glowing: "✨",
  }[mood];

  const petEmoji = state.pet ? PET_STAGES[state.pet.stage].emoji : null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Time */}
      {time && (
        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
          <span className="font-medium text-zinc-500 tabular-nums">{time}</span>
        </div>
      )}

      {/* Level Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100">
        <span className="text-base">{moodEmoji}</span>
        <span className="font-semibold text-violet-600">Lv.{state.level}</span>
        <div className="w-16 sm:w-20 h-2 bg-violet-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
        <span className="text-base">🪙</span>
        <span className="font-semibold text-amber-600">{state.coins}</span>
      </div>

      {/* Streak */}
      {state.currentStreak > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-100">
          <span className="text-base">🔥</span>
          <span className="font-semibold text-pink-600">{state.currentStreak}</span>
        </div>
      )}

      {/* Pet */}
      {petEmoji && (
        <div className={cn(
          "hidden md:flex items-center px-2 py-1.5 rounded-lg border",
          state.pet && state.pet.happiness < 30
            ? "bg-pink-50 border-pink-200"
            : "bg-blue-50 border-blue-100"
        )}>
          <span className="text-lg">{petEmoji}</span>
        </div>
      )}

      {/* Combo indicator */}
      {state.currentCombo > 1 && (
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white">
          <span className="font-semibold">⚡{state.currentCombo}x</span>
        </div>
      )}
    </div>
  );
}
