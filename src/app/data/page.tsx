"use client";

import { useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame, ACHIEVEMENTS_LIST, SHOP_ITEMS } from "@/lib/game-state";
import { playSound } from "@/lib/sounds";
import { triggerPopup } from "@/components/XPPopup";
import { cn } from "@/lib/utils";

const COACH_OPTIONS = [
  { id: "hype", emoji: "🔥", label: "Hype Coach", description: "LET'S GOOO! High energy motivation!" },
  { id: "gentle", emoji: "🌸", label: "Gentle Guide", description: "Take your time. You're doing great." },
  { id: "tough", emoji: "💪", label: "Tough Love", description: "No excuses. Push harder." },
  { id: "chaos", emoji: "🎲", label: "Chaos Agent", description: "Random vibes only!" },
] as const;

const ROOM_ITEM_INFO: Record<string, { emoji: string; funFact: string; vibe: string }> = {
  "room-plant": {
    emoji: "🪴",
    funFact: "Studies show plants can boost mood and productivity by up to 15%!",
    vibe: "Fresh & peaceful energy",
  },
  "room-poster": {
    emoji: "🖼️",
    funFact: "Visual reminders of your goals make you 42% more likely to achieve them!",
    vibe: "Motivational powerhouse",
  },
  "room-lamp": {
    emoji: "💡",
    funFact: "Warm lighting reduces stress and helps you wind down for better sleep.",
    vibe: "Cozy & calming glow",
  },
};

// Progress Ring Component
function ProgressRing({ progress, size = 100, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
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

export default function DataPage() {
  const {
    state,
    feedPet,
    useItem,
    toggleSound,
    setCoach,
    getXpProgress,
  } = useGame();

  const [selectedTab, setSelectedTab] = useState<"profile" | "pet" | "room" | "inventory" | "achievements" | "settings">("profile");
  const [selectedRoomItem, setSelectedRoomItem] = useState<string | null>(null);

  const xpData = getXpProgress();
  const levelTitles = [
    "Newbie", "Apprentice", "Trainee", "Novice", "Student",
    "Adept", "Skilled", "Expert", "Master", "Champion",
    "Hero", "Legend", "Mythic", "Divine", "Transcendent"
  ];
  const currentTitle = levelTitles[Math.min(state.level - 1, levelTitles.length - 1)];

  const handleFeedPet = () => {
    const treatItem = state.inventory.find(i => i.id === "pet-treat" && i.quantity > 0);
    if (treatItem) {
      useItem("pet-treat");
      feedPet();
      playSound("coin", state.soundEnabled);
      triggerPopup("Pet fed!", "coin");
    } else {
      playSound("error", state.soundEnabled);
      triggerPopup("No treats!", "xp");
    }
  };

  const handlePlayPet = () => {
    const toyItem = state.inventory.find(i => i.id === "pet-toy" && i.quantity > 0);
    if (toyItem) {
      useItem("pet-toy");
      playSound("coin", state.soundEnabled);
      triggerPopup("Pet happy!", "coin");
    } else {
      playSound("error", state.soundEnabled);
      triggerPopup("No toys!", "xp");
    }
  };

  const unlockedAchievements = state.achievements.filter(a => a.unlockedAt);
  const lockedAchievements = ACHIEVEMENTS_LIST.filter(a => !state.achievements.find(ua => ua.id === a.id && ua.unlockedAt));

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
      {/* Header */}
      <section className="animate-slide-up">
        <p className="text-zinc-400 text-sm">Your profile</p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1">
          Profile
        </h1>
      </section>

      {/* Tab Navigation */}
      <section className="mt-6 flex flex-wrap gap-2">
        {[
          { id: "profile", label: "Profile", emoji: "👤" },
          { id: "pet", label: "Pet", emoji: "🐾" },
          { id: "room", label: "Room", emoji: "🏠" },
          { id: "inventory", label: "Inventory", emoji: "🎒" },
          { id: "achievements", label: "Achievements", emoji: "🏆" },
          { id: "settings", label: "Settings", emoji: "⚙️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedTab(tab.id as typeof selectedTab);
              playSound("click", state.soundEnabled);
            }}
            className={cn(
              "px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200",
              selectedTab === tab.id
                ? "bg-violet-500 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]"
                : "bg-white text-zinc-600 hover:bg-zinc-50"
            )}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </section>

      {/* Profile Tab */}
      {selectedTab === "profile" && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 animate-slide-up">
          {/* Player Card */}
          <Card className="text-center relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full opacity-50 blur-3xl" />
            <div className="relative">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
                <span className="text-4xl">😊</span>
              </div>
              <CardTitle className="text-2xl mt-4">Level {state.level}</CardTitle>
              <CardDescription className="text-lg font-medium text-violet-600">
                {currentTitle}
              </CardDescription>

              {/* XP Progress */}
              <div className="mt-6 flex justify-center">
                <div className="relative">
                  <ProgressRing progress={xpData.percent} size={100} strokeWidth={8} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-zinc-900">{Math.round(xpData.percent)}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-zinc-500">
                <span className="font-semibold text-violet-600">{xpData.current}</span> / {xpData.needed} XP
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Total XP: {state.totalXp}
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card glow="yellow" className="text-center">
              <span className="text-3xl">🪙</span>
              <p className="text-2xl font-bold text-zinc-900 mt-2">{state.coins}</p>
              <p className="text-xs text-zinc-500">Coins</p>
            </Card>
            <Card glow="pink" className="text-center">
              <span className="text-3xl">🔥</span>
              <p className="text-2xl font-bold text-zinc-900 mt-2">{state.currentStreak}</p>
              <p className="text-xs text-zinc-500">Streak</p>
            </Card>
            <Card glow="purple" className="text-center">
              <span className="text-3xl">⚡</span>
              <p className="text-2xl font-bold text-zinc-900 mt-2">{state.criticalHits}</p>
              <p className="text-xs text-zinc-500">Crits</p>
            </Card>
            <Card glow="blue" className="text-center">
              <span className="text-3xl">👾</span>
              <p className="text-2xl font-bold text-zinc-900 mt-2">{state.bossesDefeated}</p>
              <p className="text-xs text-zinc-500">Bosses</p>
            </Card>
          </div>

          {/* Lifetime Stats */}
          <Card className="md:col-span-2">
            <CardTitle>Lifetime Stats</CardTitle>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-zinc-900">{state.totalQuestsCompleted}</p>
                <p className="text-xs text-zinc-500">Quests Done</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{state.bestStreak}</p>
                <p className="text-xs text-zinc-500">Best Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{state.bestCombo}</p>
                <p className="text-xs text-zinc-500">Max Combo</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{unlockedAchievements.length}</p>
                <p className="text-xs text-zinc-500">Achievements</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pet Tab */}
      {selectedTab === "pet" && (
        <div className="mt-8 animate-slide-up">
          {state.pet ? (
            <Card className="text-center max-w-md mx-auto relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-pink-100 to-violet-100 rounded-full opacity-50 blur-3xl" />
              <div className="relative">
                <div className="text-7xl mb-4 animate-float">{state.pet.emoji}</div>
                <CardTitle className="text-2xl">{state.pet.name}</CardTitle>
                <CardDescription>Your loyal companion</CardDescription>

                {/* Pet Stats */}
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-zinc-500 mb-2">
                      <span>Happiness</span>
                      <span>{state.pet.happiness}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all"
                        style={{ width: `${state.pet.happiness}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-zinc-500 mb-2">
                      <span>Energy</span>
                      <span>{state.pet.energy}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                        style={{ width: `${state.pet.energy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pet Actions */}
                <div className="mt-6 flex gap-3 justify-center">
                  <Button
                    onClick={handleFeedPet}
                    disabled={!state.inventory.find(i => i.id === "pet-treat" && i.quantity > 0)}
                  >
                    🍖 Feed
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handlePlayPet}
                    disabled={!state.inventory.find(i => i.id === "pet-toy" && i.quantity > 0)}
                  >
                    🎾 Play
                  </Button>
                </div>

                <p className="mt-4 text-xs text-zinc-400">
                  Treats: {state.inventory.find(i => i.id === "pet-treat")?.quantity ?? 0} |
                  Toys: {state.inventory.find(i => i.id === "pet-toy")?.quantity ?? 0}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">🥚</div>
              <CardTitle>No Pet Yet</CardTitle>
              <CardDescription>
                Keep completing quests to unlock your companion!
              </CardDescription>
              <p className="mt-4 text-sm text-zinc-400">
                Reach Level 5 to get your first pet
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Room Tab */}
      {selectedTab === "room" && (
        <div className="mt-8 animate-slide-up">
          {/* Item Detail Modal */}
          {selectedRoomItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setSelectedRoomItem(null)}
            >
              <div
                className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const shopItem = SHOP_ITEMS.find(s => s.id === selectedRoomItem);
                  const itemInfo = ROOM_ITEM_INFO[selectedRoomItem];
                  const quantity = state.inventory.find(i => i.id === selectedRoomItem)?.quantity || 0;
                  return (
                    <>
                      <div className="text-center">
                        <span className="text-6xl block mb-4">{itemInfo?.emoji || "📦"}</span>
                        <h3 className="text-xl font-bold text-zinc-900">{shopItem?.name}</h3>
                        <p className="text-sm text-violet-600 font-medium mt-1">{itemInfo?.vibe}</p>
                      </div>
                      <div className="mt-4 p-4 bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl">
                        <p className="text-sm text-zinc-600 italic">"{itemInfo?.funFact}"</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-zinc-500">You own:</span>
                        <span className="font-bold text-zinc-900">{quantity}x</span>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={() => setSelectedRoomItem(null)}
                      >
                        Close
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Room Preview */}
          <Card glow="purple" className="relative overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50" />
            <div className="relative min-h-[300px] flex flex-col">
              <CardTitle className="text-base mb-2">Your Room</CardTitle>
              <p className="text-xs text-zinc-500 mb-4">Tap items to see details</p>

              {/* Room Items Display */}
              <div className="flex-1 relative rounded-xl border-2 border-dashed border-zinc-200 bg-white/50 p-4">
                {state.inventory.filter(i =>
                  SHOP_ITEMS.find(s => s.id === i.id && s.type === "room-item")
                ).length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                    <p className="text-center">
                      <span className="text-4xl block mb-2">🏠</span>
                      Your room is empty!<br />
                      <span className="text-sm">Buy decorations from the shop</span>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 h-full">
                    {state.inventory
                      .filter(i => SHOP_ITEMS.find(s => s.id === i.id && s.type === "room-item"))
                      .map((item) => {
                        const shopItem = SHOP_ITEMS.find(s => s.id === item.id);
                        const itemInfo = ROOM_ITEM_INFO[item.id];
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSelectedRoomItem(item.id);
                              playSound("click", state.soundEnabled);
                            }}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                          >
                            <span className="text-4xl mb-2">{itemInfo?.emoji || "📦"}</span>
                            <p className="text-xs font-medium text-zinc-700 text-center">
                              {shopItem?.name}
                            </p>
                            {item.quantity > 1 && (
                              <span className="text-xs text-zinc-400">x{item.quantity}</span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Room Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <span className="text-2xl">🪴</span>
              <p className="text-lg font-bold text-zinc-900 mt-2">
                {state.inventory.find(i => i.id === "room-plant")?.quantity || 0}
              </p>
              <p className="text-xs text-zinc-500">Plants</p>
            </Card>
            <Card className="text-center">
              <span className="text-2xl">🖼️</span>
              <p className="text-lg font-bold text-zinc-900 mt-2">
                {state.inventory.find(i => i.id === "room-poster")?.quantity || 0}
              </p>
              <p className="text-xs text-zinc-500">Posters</p>
            </Card>
            <Card className="text-center">
              <span className="text-2xl">💡</span>
              <p className="text-lg font-bold text-zinc-900 mt-2">
                {state.inventory.find(i => i.id === "room-lamp")?.quantity || 0}
              </p>
              <p className="text-xs text-zinc-500">Lamps</p>
            </Card>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {selectedTab === "inventory" && (
        <div className="mt-8 animate-slide-up">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.inventory.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3 text-center">
                <CardTitle>Empty Backpack</CardTitle>
                <CardDescription>Visit the shop to buy items!</CardDescription>
              </Card>
            ) : (
              state.inventory.map((item) => {
                const shopItem = SHOP_ITEMS.find(s => s.id === item.id);
                return (
                  <Card key={item.id} glow="yellow" className="flex flex-col">
                    <CardTitle className="text-base">{shopItem?.name ?? item.id}</CardTitle>
                    <CardDescription className="flex-1 text-sm">
                      {shopItem?.description ?? "A mysterious item"}
                    </CardDescription>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-600">
                        Qty: {item.quantity}
                      </span>
                      {shopItem?.type === "power-up" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            useItem(item.id);
                            playSound("coin", state.soundEnabled);
                            triggerPopup(`Used ${shopItem.name}!`, "xp");
                          }}
                        >
                          Use
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {selectedTab === "achievements" && (
        <div className="mt-8 animate-slide-up">
          {/* Unlocked */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Unlocked ({unlockedAchievements.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {unlockedAchievements.map((achievement) => (
                  <Card key={achievement.id} glow="yellow">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div>
                        <CardTitle className="text-base">{achievement.name}</CardTitle>
                        <CardDescription className="text-xs">{achievement.description}</CardDescription>
                        <p className="mt-2 text-xs text-amber-600 font-medium">
                          +{achievement.reward} coins
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-400 mb-4">Locked ({lockedAchievements.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="opacity-60">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl grayscale">🔒</span>
                    <div>
                      <CardTitle className="text-base text-zinc-400">{achievement.name}</CardTitle>
                      <CardDescription className="text-xs">{achievement.description}</CardDescription>
                      <p className="mt-2 text-xs text-zinc-400">
                        +{achievement.reward} coins
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === "settings" && (
        <div className="mt-8 grid gap-6 max-w-2xl animate-slide-up">
          {/* Sound Toggle */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Sound Effects</CardTitle>
                <CardDescription>Toggle game sounds on/off</CardDescription>
              </div>
              <button
                onClick={() => {
                  toggleSound();
                  playSound("click", !state.soundEnabled);
                }}
                className={cn(
                  "w-14 h-7 rounded-full transition-all duration-300 relative",
                  state.soundEnabled ? "bg-violet-500" : "bg-zinc-200"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
                    state.soundEnabled ? "left-7" : "left-0.5"
                  )}
                />
              </button>
            </div>
          </Card>

          {/* Coach Selection */}
          <Card>
            <CardTitle className="text-base">Coach Style</CardTitle>
            <CardDescription>Choose your motivational companion</CardDescription>
            <div className="mt-4 grid gap-3">
              {COACH_OPTIONS.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => {
                    setCoach(coach.id);
                    playSound("click", state.soundEnabled);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left",
                    state.coach === coach.id
                      ? "border-violet-500 bg-violet-50"
                      : "border-zinc-100 bg-white hover:border-zinc-200"
                  )}
                >
                  <span className="text-2xl">{coach.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-zinc-900">{coach.label}</p>
                    <p className="text-xs text-zinc-500">{coach.description}</p>
                  </div>
                  {state.coach === coach.id && (
                    <span className="text-violet-600 font-medium text-sm">Active</span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Debug Info */}
          <Card className="bg-zinc-50">
            <CardTitle className="text-sm text-zinc-400">Debug Info</CardTitle>
            <pre className="mt-2 text-xs text-zinc-400 overflow-auto max-h-40">
              Last active: {state.lastActiveDate ?? "Never"}
              {"\n"}Daily spin: {state.dailySpinAvailable ? "Available" : "Used"}
              {"\n"}Total quests: {state.totalQuestsCompleted}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
