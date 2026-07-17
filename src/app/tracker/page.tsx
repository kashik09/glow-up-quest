"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { videoSlots, planData, PlanKey, defaultVideoLinks } from "@/data/plans";
import { cn } from "@/lib/utils";
import {
  type PhotoEntry,
  getAllPhotos,
  savePhoto,
  deletePhoto as deletePhotoFromDB,
  migrateFromLocalStorage,
  exportPhotos,
} from "@/lib/photo-db";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

const VIDEO_STORAGE_KEY = "glowUpVideos";
const CYCLE_STORAGE_KEY = "glowUpCycle";

type VideoMap = Record<string, string>;

type VideoPreview =
  | { kind: "youtube"; src: string }
  | { kind: "direct"; src: string }
  | { kind: "external"; src: string };

const defaultVideos = Object.fromEntries(
  videoSlots.map((slot) => [slot, defaultVideoLinks[slot] || ""])
) as VideoMap;

function getVideoPreview(value: string): VideoPreview | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("http")) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    let youtubeId = "";

    if (host === "youtu.be") {
      youtubeId = url.pathname.slice(1).split("/")[0] ?? "";
    } else if (host.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        youtubeId = url.searchParams.get("v") ?? "";
      } else if (url.pathname.startsWith("/shorts/")) {
        youtubeId = url.pathname.split("/")[2] ?? "";
      } else if (url.pathname.startsWith("/embed/")) {
        youtubeId = url.pathname.split("/")[2] ?? "";
      }
    }

    if (youtubeId) {
      return {
        kind: "youtube",
        src: `https://www.youtube.com/embed/${youtubeId}`,
      };
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(`${url.pathname}${url.search}`)) {
      return { kind: "direct", src: trimmed };
    }

    return { kind: "external", src: trimmed };
  } catch {
    return null;
  }
}

function addDays(baseDate: Date, days: number) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isSameDay(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString();
}

export default function TrackerPage() {
  const [tab, setTab] = useState<"photos" | "meals" | "videos">("photos");
  const [videos, setVideos] = useState<VideoMap>(defaultVideos);
  const [saveLabel, setSaveLabel] = useState("Save");
  const [activeVideoSlot, setActiveVideoSlot] = useState<(typeof videoSlots)[number]>(videoSlots[0]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [startDate, setStartDate] = useState("");
  const [day14Date, setDay14Date] = useState<Date | null>(null);
  const [day21Date, setDay21Date] = useState<Date | null>(null);
  const [photoLabel, setPhotoLabel] = useState<string>("Progress");
  const [planKey] = useState<PlanKey>("jumpstart");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get today's date and day info
  const today = new Date();
  const dayOfWeek = DAYS_OF_WEEK[today.getDay()];
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Get today's video slots from plan data
  const todaysPlan = planData[planKey].week.find((d) => d.day === dayOfWeek);
  const todaysVideoSlots: (typeof videoSlots)[number][] = todaysPlan?.videoSlots ?? [];

  // Load saved data
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedVideos = window.localStorage.getItem(VIDEO_STORAGE_KEY);
    if (storedVideos) {
      const merged = { ...defaultVideos, ...JSON.parse(storedVideos) } as VideoMap;
      setVideos(merged);
      const firstFilled = videoSlots.find((slot) => Boolean(merged[slot]));
      if (firstFilled) setActiveVideoSlot(firstFilled);
    }

    const storedCycle = window.localStorage.getItem(CYCLE_STORAGE_KEY);
    if (storedCycle) setStartDate(storedCycle);

    // Load photos from IndexedDB (with migration from localStorage)
    const loadPhotos = async () => {
      try {
        // First, migrate any old localStorage photos
        await migrateFromLocalStorage();
        // Then load all photos from IndexedDB
        const dbPhotos = await getAllPhotos();
        setPhotos(dbPhotos);
      } catch (error) {
        console.error("Failed to load photos:", error);
      }
    };
    loadPhotos();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (requestedTab === "photos" || requestedTab === "meals" || requestedTab === "videos") {
      setTab(requestedTab);
    }
  }, []);

  // Calculate Day 14 and Day 21 when start date changes
  useEffect(() => {
    if (!startDate) {
      setDay14Date(null);
      setDay21Date(null);
      setPhotoLabel("Progress");
      return;
    }
    const base = new Date(`${startDate}T00:00:00`);
    const d14 = addDays(base, 13);
    const d21 = addDays(base, 20);
    setDay14Date(d14);
    setDay21Date(d21);

    // Auto-detect photo label based on today's date
    const today = new Date();
    if (isSameDay(today, d14)) {
      setPhotoLabel("Day 14");
    } else if (isSameDay(today, d21)) {
      setPhotoLabel("Day 21");
    } else {
      setPhotoLabel("Progress");
    }

    // Save to localStorage
    window.localStorage.setItem(CYCLE_STORAGE_KEY, startDate);
  }, [startDate]);

  const handleVideoChange = (slot: string, value: string) => {
    setVideos((prev) => ({ ...prev, [slot]: value }));
    if (value.trim()) {
      setActiveVideoSlot(slot as (typeof videoSlots)[number]);
    }
  };

  const handleSaveVideos = () => {
    window.localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
    setSaveLabel("Saved!");
    setTimeout(() => setSaveLabel("Save"), 1400);
  };

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const newPhoto: PhotoEntry = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        dataUrl,
        date: new Date().toISOString(),
        label,
      };

      try {
        await savePhoto(newPhoto);
        setPhotos(prev => [...prev, newPhoto]);
      } catch (error) {
        console.error("Failed to save photo:", error);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }, []);

  const handleDeletePhoto = useCallback(async (photo: PhotoEntry) => {
    try {
      await deletePhotoFromDB(photo.id);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  }, []);

  const handleExportPhotos = useCallback(async () => {
    try {
      const data = await exportPhotos();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `glow-up-photos-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export photos:", error);
    }
  }, []);

  const isToday14 = day14Date && isSameDay(new Date(), day14Date);
  const isToday21 = day21Date && isSameDay(new Date(), day21Date);
  const playableSlots = useMemo(
    () => videoSlots.filter((slot) => (videos[slot] ?? "").trim().length > 0),
    [videos]
  );
  const activeVideoValue = videos[activeVideoSlot] ?? "";
  const activeVideoPreview = useMemo(
    () => getVideoPreview(activeVideoValue),
    [activeVideoValue]
  );

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
      {/* Header */}
      <section className="animate-slide-up">
        <p className="text-zinc-400 text-sm">Track your journey</p>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mt-1">
          Progress Tracker
        </h1>
      </section>

      {/* Tabs */}
      <section className="mt-6 flex flex-wrap gap-2">
        {[
          { key: "photos", label: "Photos", icon: "📸" },
          { key: "meals", label: "Meals", icon: "🥗" },
          { key: "videos", label: "Videos", icon: "🎬" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200",
              tab === t.key
                ? "bg-violet-500 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]"
                : "bg-white text-zinc-600 hover:bg-zinc-50"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </section>

      {/* Photos Tab */}
      {tab === "photos" && (
        <div className="mt-8 space-y-8 animate-fade-in">
          {/* Cycle Tracker + Upload Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cycle Tracker */}
            <Card className="space-y-4">
              <CardTitle className="flex items-center gap-2">
                🩸 Cycle Tracker
              </CardTitle>
              <CardDescription>
                Enter your period start date to auto-calculate photo days.
              </CardDescription>
              <div className="space-y-2">
                <label htmlFor="start-date" className="text-sm font-medium text-zinc-700">
                  Period Start Date
                </label>
                <DatePicker
                  id="start-date"
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={cn(
                  "p-4 rounded-xl transition-all duration-300",
                  isToday14
                    ? "bg-gradient-to-br from-pink-500 to-violet-500 text-white"
                    : "bg-gradient-to-br from-pink-50 to-violet-50"
                )}>
                  <span className={cn(
                    "block text-xs font-medium uppercase tracking-wide",
                    isToday14 ? "text-white/80" : "text-zinc-500"
                  )}>
                    Day 14 Photo
                  </span>
                  <p className={cn(
                    "text-xl font-bold mt-1",
                    isToday14 ? "text-white" : "text-zinc-900"
                  )}>
                    {day14Date ? formatDate(day14Date) : "—"}
                  </p>
                  {isToday14 && <p className="text-xs mt-1 text-white/90">📸 TODAY! Take your photo</p>}
                </div>
                <div className={cn(
                  "p-4 rounded-xl transition-all duration-300",
                  isToday21
                    ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white"
                    : "bg-gradient-to-br from-violet-50 to-blue-50"
                )}>
                  <span className={cn(
                    "block text-xs font-medium uppercase tracking-wide",
                    isToday21 ? "text-white/80" : "text-zinc-500"
                  )}>
                    Day 21 Photo
                  </span>
                  <p className={cn(
                    "text-xl font-bold mt-1",
                    isToday21 ? "text-white" : "text-zinc-900"
                  )}>
                    {day21Date ? formatDate(day21Date) : "—"}
                  </p>
                  {isToday21 && <p className="text-xs mt-1 text-white/90">📸 TODAY! Take your photo</p>}
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                Best results: morning, empty stomach, same lighting.
              </p>
            </Card>

            {/* Upload Section */}
            <Card className="space-y-4">
              <CardTitle>📤 Upload Progress Photo</CardTitle>
              <CardDescription>
                {isToday14
                  ? "It's Day 14! Upload your mid-cycle photo."
                  : isToday21
                  ? "It's Day 21! Upload your pre-period photo."
                  : "Upload anytime to track your journey."}
              </CardDescription>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, photoLabel)}
                className="hidden"
              />

              {/* Quick upload buttons */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Day 14", active: isToday14 },
                  { label: "Day 21", active: isToday21 },
                  { label: "Progress", active: !isToday14 && !isToday21 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => {
                      setPhotoLabel(btn.label);
                      fileInputRef.current?.click();
                    }}
                    className={cn(
                      "rounded-xl border-2 border-dashed p-4 transition-all duration-200 hover:scale-[1.02]",
                      btn.active
                        ? "border-violet-300 bg-violet-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <span className="text-2xl">📸</span>
                    <p className="text-sm font-medium text-zinc-700 mt-1">{btn.label}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">
                  Your Gallery ({photos.length} photos)
                </h3>
                <Button variant="secondary" onClick={handleExportPhotos}>
                  Backup Photos
                </Button>
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <Card
                    key={photo.id}
                    className="p-2 space-y-2 hover:scale-[1.02] transition-transform"
                  >
                    <div className="relative group">
                      <img
                        src={photo.dataUrl}
                        alt={`Progress photo`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                      <span className={cn(
                        "absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white",
                        photo.label === "Day 14" ? "bg-pink-500" :
                        photo.label === "Day 21" ? "bg-violet-500" : "bg-zinc-600"
                      )}>
                        {photo.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 px-1">
                      {new Date(photo.date).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                Photos are stored locally in your browser database. Use "Backup Photos" to download a copy.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Meals Tab */}
      {tab === "meals" && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-3">
            <Card glow="purple">
              <CardTitle className="text-base">📏 Portion Guide</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-600">
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-400"></span>Protein: palm-sized</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-violet-400"></span>Carbs: fist-sized</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400"></span>Fats: thumb-sized</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span>Veggies: fill the rest</li>
              </ul>
            </Card>
            <Card glow="pink">
              <CardTitle className="text-base">🥩 Your Inventory</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-500">
                <li>Eggs, chicken, steak, salmon</li>
                <li>Mincemeat tacos + kachumbari</li>
                <li>Rice, noodles, sukuma wiki</li>
                <li>Bacon/sausages (modest portions)</li>
              </ul>
            </Card>
            <Card glow="blue">
              <CardTitle className="text-base">💧 Hydration</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-500">
                <li>Water: 2–3 liters daily</li>
                <li>Watermelon juice: 8 oz blended</li>
                <li>Have juice with a meal</li>
              </ul>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card glow="yellow">
              <CardTitle className="text-base">🍳 Breakfast Combos</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-500">
                <li>Eggs + bacon + kachumbari</li>
                <li>Eggs + leftover chicken + veg</li>
                <li>Chia pudding + eggs on the side</li>
              </ul>
            </Card>
            <Card glow="purple">
              <CardTitle className="text-base">🥗 Lunch Combos</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-500">
                <li>Chicken + rice + sukuma</li>
                <li>Steak + rice/noodles + veg</li>
                <li>Tacos + kachumbari + veg</li>
              </ul>
            </Card>
            <Card glow="blue">
              <CardTitle className="text-base">🍽️ Dinner Combos</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-500">
                <li>Salmon + rice + sukuma</li>
                <li>Chicken + noodles + veg</li>
                <li>Eggs + veg + small carb</li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Videos Tab */}
      {tab === "videos" && (
        <div className="mt-8 animate-fade-in">
          {/* Today's Workout Player - Day Dynamic */}
          <Card glow="purple" className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  {formattedDate}
                </CardDescription>
                <CardTitle className="mt-1 flex items-center gap-2">
                  {todaysPlan?.focus || "Rest Day"}
                  <span className="text-lg">
                    {dayOfWeek === "Sunday" ? "😴" : "💪"}
                  </span>
                </CardTitle>
              </div>
              {todaysPlan && (
                <span className="text-sm text-zinc-500">{todaysPlan.detail}</span>
              )}
            </div>

            {todaysVideoSlots.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-400">No workouts scheduled for today. Enjoy your rest!</p>
            ) : (
              <>
                {/* Today's video slot buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {todaysVideoSlots.map((slot) => {
                    const hasVideo = (videos[slot] ?? "").trim().length > 0;
                    return (
                      <button
                        key={slot}
                        onClick={() => hasVideo && setActiveVideoSlot(slot)}
                        disabled={!hasVideo}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                          activeVideoSlot === slot && hasVideo
                            ? "bg-violet-500 text-white"
                            : hasVideo
                            ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            : "bg-zinc-50 text-zinc-400 cursor-not-allowed"
                        )}
                      >
                        {slot.replace(/^[^:]+:\s*/, "")}
                        {!hasVideo && " (not set)"}
                      </button>
                    );
                  })}
                </div>

                {/* Video player */}
                {todaysVideoSlots.some((slot) => (videos[slot] ?? "").trim().length > 0) ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 aspect-video">
                    {activeVideoPreview?.kind === "youtube" ? (
                      <iframe
                        className="h-full w-full"
                        src={activeVideoPreview.src}
                        title={activeVideoSlot}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : activeVideoPreview?.kind === "direct" ? (
                      <video
                        className="h-full w-full"
                        src={activeVideoPreview.src}
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : activeVideoPreview ? (
                      <div className="h-full w-full flex items-center justify-center text-center p-6">
                        <div>
                          <p className="text-white font-medium">Preview not embeddable</p>
                          <a
                            href={activeVideoPreview.src}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-sm font-medium text-violet-400 hover:text-violet-300"
                          >
                            Open video in new tab →
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-center p-6">
                        <p className="text-zinc-400">Select a video above to play</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-400">
                    Add video links below for today&apos;s workout slots to unlock the player.
                  </p>
                )}
              </>
            )}
          </Card>

          {/* All Videos Section */}
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-600 hover:text-zinc-900 mb-4">
              <span className="transition-transform group-open:rotate-90">▶</span>
              Manage All Video Links
            </summary>
            <div className="grid gap-4 md:grid-cols-2">
              {videoSlots.map((slot, index) => {
                const isToday = todaysVideoSlots.includes(slot);
                return (
                  <Card
                    key={slot}
                    glow={isToday ? "pink" : "none"}
                    className="space-y-2 animate-slide-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2" htmlFor={slot}>
                      {slot}
                      {isToday && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">Today</span>}
                    </label>
                    <Input
                      id={slot}
                      placeholder="Paste video link or title"
                      value={videos[slot] ?? ""}
                      onChange={(e) => handleVideoChange(slot, e.target.value)}
                    />
                  </Card>
                );
              })}
            </div>
            <div className="mt-6">
              <Button onClick={handleSaveVideos}>
                {saveLabel}
              </Button>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
