"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checklistItems, planData, PlanKey, videoSlots } from "@/data/plans";

const VIDEO_STORAGE_KEY = "glowUpVideos";
const CHECKLIST_STORAGE_KEY = "glowUpChecklist";
const PHOTOS_STORAGE_KEY = "glowUpPhotos";

type VideoMap = Record<string, string>;

type ChecklistMap = Record<number, boolean>;

type PhotoEntry = {
  dataUrl: string;
  date: string;
  label: string;
};

const defaultVideos = Object.fromEntries(
  videoSlots.map((slot) => [slot, ""])
) as VideoMap;

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

export default function Home() {
  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [planKey, setPlanKey] = useState<PlanKey>("jumpstart");
  const [contentTab, setContentTab] = useState<"meals" | "videos" | "tracking">(
    "meals"
  );
  const [videos, setVideos] = useState<VideoMap>(defaultVideos);
  const [saveLabel, setSaveLabel] = useState("Save video list");
  const [checklist, setChecklist] = useState<ChecklistMap>({});
  const [startDate, setStartDate] = useState("");
  const [day14, setDay14] = useState("—");
  const [day21, setDay21] = useState("—");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plan = planData[planKey];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(VIDEO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as VideoMap;
      setVideos({ ...defaultVideos, ...parsed });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, ChecklistMap>;
      setChecklist(parsed[todayKey] ?? {});
    }
  }, [todayKey]);

  useEffect(() => {
    if (!startDate) {
      setDay14("—");
      setDay21("—");
      return;
    }
    const base = new Date(`${startDate}T00:00:00`);
    setDay14(formatDate(addDays(base, 13)));
    setDay21(formatDate(addDays(base, 20)));
  }, [startDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (stored) {
      setPhotos(JSON.parse(stored) as PhotoEntry[]);
    }
  }, []);

  const handleVideoChange = (slot: string, value: string) => {
    setVideos((prev) => ({ ...prev, [slot]: value }));
  };

  const handleSaveVideos = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
    setSaveLabel("Saved!");
    window.setTimeout(() => setSaveLabel("Save video list"), 1400);
  };

  const handleChecklistChange = (index: number, value: boolean) => {
    const nextChecklist = { ...checklist, [index]: value };
    setChecklist(nextChecklist);
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Record<string, ChecklistMap>) : {};
    parsed[todayKey] = nextChecklist;
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(parsed));
  };

  const openPlannerTab = (tab: "meals" | "videos" | "tracking") => {
    setContentTab(tab);
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const label =
        day14 !== "—" && formatDate(new Date()) === day14
          ? "Day 14"
          : day21 !== "—" && formatDate(new Date()) === day21
          ? "Day 21"
          : "Progress";
      const newPhoto: PhotoEntry = {
        dataUrl,
        date: new Date().toISOString(),
        label,
      };
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      window.localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleDeletePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    window.localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
  };

  return (
    <div className="relative overflow-hidden">
      {/* Pastel blurred circles */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(249,168,212,0.4),transparent_70%)] animate-pulse-slow" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.35),transparent_70%)] animate-float" />
      <div className="pointer-events-none absolute -bottom-44 -left-44 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.3),transparent_70%)] animate-pulse-slow" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.25),transparent_70%)] animate-float" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(249,168,212,0.2),transparent_70%)]" />

      <header className="px-6 pb-16 pt-8 md:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-pink-bright via-purple-bright to-blue-bright bg-clip-text text-transparent">
            Glow Up Quest
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-muted">
            <a href="#schedule" className="hover:text-purple-bright transition-colors">
              Schedule
            </a>
            <a href="#routine" className="hover:text-pink-bright transition-colors">
              Daily Routine
            </a>
            <button
              type="button"
              onClick={() => openPlannerTab("meals")}
              className="hover:text-blue-bright transition-colors"
            >
              Meals
            </button>
            <button
              type="button"
              onClick={() => openPlannerTab("videos")}
              className="hover:text-yellow-bright transition-colors"
            >
              Videos
            </button>
            <button
              type="button"
              onClick={() => openPlannerTab("tracking")}
              className="hover:text-purple-bright transition-colors"
            >
              Tracking
            </button>
          </div>
        </nav>

        <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] bg-gradient-to-r from-pink-bright to-purple-bright bg-clip-text text-transparent">
              Level Up · No Equipment · Indoor Quest
            </p>
            <h1 className="mt-3 text-3xl md:text-5xl bg-gradient-to-r from-ink via-purple-bright to-pink-bright bg-clip-text text-transparent">
              Your glow up starts here.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted">
              A clear, ADHD-friendly quest that starts at your level, keeps you consistent, and
              protects your energy. Adjust the details, never restart the game.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="pink"
                type="button"
                onClick={() =>
                  document
                    .getElementById("schedule")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See the week
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  document
                    .getElementById("checklist")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Daily checklist
              </Button>
            </div>
          </div>

          <Card glow="pink" className="bg-white/80 backdrop-blur-lg">
            <CardTitle className="text-xl">Today&apos;s Quest</CardTitle>
            <CardDescription>Choose your difficulty level.</CardDescription>
            <div className="mt-4 flex gap-2">
              <button
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                  planKey === "jumpstart"
                    ? "bg-gradient-to-r from-pink to-purple text-ink shadow-glow"
                    : "bg-purple-light/50 text-ink hover:bg-purple-light"
                }`}
                onClick={() => setPlanKey("jumpstart")}
              >
                Jumpstart Mode
              </button>
              <button
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                  planKey === "maintenance"
                    ? "bg-gradient-to-r from-blue to-purple text-ink shadow-glow-blue"
                    : "bg-blue-light/50 text-ink hover:bg-blue-light"
                }`}
                onClick={() => setPlanKey("maintenance")}
              >
                Chill Mode
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-pink-light/50 to-purple-light/50 p-4 border border-purple/20">
              <h3 className="text-lg font-bold text-purple-bright">{plan.title}</h3>
              <p className="text-sm text-muted">{plan.description}</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {plan.pills.map((pill, i) => (
                  <li
                    key={pill}
                    className={`rounded-full px-3 py-2 font-medium ${
                      i === 0
                        ? "bg-pink-light/70 text-pink-bright"
                        : i === 1
                        ? "bg-purple-light/70 text-purple-bright"
                        : "bg-blue-light/70 text-blue-bright"
                    }`}
                  >
                    {pill}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </header>

      <main>
        <section id="schedule" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-purple-bright to-blue-bright bg-clip-text text-transparent">
              Weekly Quest Map
            </h2>
            <p className="text-sm text-muted">Your path to leveling up.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {plan.week.map((item, index) => {
              const slots = item.videoSlots ?? [];
              const glowColor = (["pink", "purple", "blue", "yellow"] as const)[index % 4];
              return (
                <Card key={`${item.day}-${item.focus}`} glow={glowColor}>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${
                    index % 4 === 0 ? "text-pink-bright" :
                    index % 4 === 1 ? "text-purple-bright" :
                    index % 4 === 2 ? "text-blue-bright" : "text-yellow-bright"
                  }`}>
                    {item.day}
                  </p>
                  <CardTitle className="mt-2 text-lg">{item.focus}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                  {slots.length > 0 ? (
                    <div className="mt-3 rounded-xl bg-gradient-to-br from-purple-light/30 to-pink-light/30 px-3 py-2 text-xs">
                      <div className="grid gap-2">
                        {slots.map((slot) => {
                          const value = videos[slot] ?? "";
                          const isLink = value.startsWith("http");
                          return (
                            <div key={slot} className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase tracking-[0.18em] text-muted font-medium">
                                {slot}
                              </span>
                              {value ? (
                                isLink ? (
                                  <a
                                    href={value}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-purple-bright hover:text-pink-bright transition-colors"
                                  >
                                    Play Video
                                  </a>
                                ) : (
                                  <span className="text-ink">{value}</span>
                                )
                              ) : (
                                <span className="text-muted/60 italic">Add in library below</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </section>

        <section id="routine" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-pink-bright to-yellow-bright bg-clip-text text-transparent">
              Daily Power-Ups
            </h2>
            <p className="text-sm text-muted">Your daily quest schedule (adjust times as needed).</p>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              { time: "5:45", title: "Wake up + water", note: "Bathroom, a few sips of water.", color: "pink" },
              { time: "6:00", title: "Chia pudding", note: "Keep honey light; add protein if you can.", color: "purple" },
              { time: "6:15", title: "Watermelon juice", note: "8 oz blended, with a meal if possible.", color: "blue" },
              { time: "6:30", title: "Warm-up", note: "5 min, protect your joints.", color: "yellow" },
              { time: "6:35", title: "Main workout", note: "15–25 min. Pause and modify freely.", color: "pink" },
              { time: "6:55", title: "Cool-down stretch", note: "12 min. Reduces soreness.", color: "purple" },
              { time: "7:30", title: "Breakfast", note: "Eggs + protein + veggies.", color: "blue" },
              { time: "12:00", title: "Lunch", note: "Protein + fist-sized carbs + veggies.", color: "yellow" },
              { time: "18:00", title: "Dinner", note: "Protein + veggies + smaller carb portion.", color: "pink" },
              { time: "21:30", title: "Wind down", note: "Prep clothes + chia for tomorrow.", color: "purple" },
            ].map((item) => (
              <Card
                key={item.time}
                glow={item.color as "pink" | "purple" | "blue" | "yellow"}
                className="flex flex-col gap-2 md:flex-row md:items-center"
              >
                <span className={`text-sm font-bold md:w-20 ${
                  item.color === "pink" ? "text-pink-bright" :
                  item.color === "purple" ? "text-purple-bright" :
                  item.color === "blue" ? "text-blue-bright" : "text-yellow-bright"
                }`}>
                  {item.time}
                </span>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.note}</CardDescription>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="planner" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-blue-bright to-purple-bright bg-clip-text text-transparent">
              Inventory & Stats
            </h2>
            <p className="text-sm text-muted">
              Your items, power-ups, and progress tracking.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { key: "meals", label: "Food Items", color: "blue" },
              { key: "videos", label: "Video Library", color: "purple" },
              { key: "tracking", label: "Progress Photos", color: "pink" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setContentTab(tab.key as "meals" | "videos" | "tracking")
                }
                className={`rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                  contentTab === tab.key
                    ? tab.color === "blue"
                      ? "bg-gradient-to-r from-blue to-blue-bright text-white shadow-glow-blue"
                      : tab.color === "purple"
                      ? "bg-gradient-to-r from-purple to-purple-bright text-white shadow-glow-purple"
                      : "bg-gradient-to-r from-pink to-pink-bright text-white shadow-glow"
                    : "bg-white/50 text-muted hover:bg-white/80 border-2 border-transparent hover:border-purple/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {contentTab === "meals" ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card glow="blue">
                  <CardTitle className="text-lg">Portion Guide</CardTitle>
                  <ul className="mt-3 grid gap-2 text-sm">
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-pink"></span>Protein: palm-sized</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple"></span>Carbs: fist-sized</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue"></span>Fats: thumb-sized</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow"></span>Veggies: fill the rest</li>
                  </ul>
                </Card>
                <Card glow="purple">
                  <CardTitle className="text-lg">Your Inventory</CardTitle>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    <li>Eggs, chicken, steak, salmon</li>
                    <li>Mincemeat tacos + kachumbari</li>
                    <li>Rice, noodles, sukuma wiki</li>
                    <li>Bacon/sausages (modest portions)</li>
                  </ul>
                </Card>
                <Card glow="pink">
                  <CardTitle className="text-lg">Hydration Power-Up</CardTitle>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    <li>Water: 2–3 liters</li>
                    <li>Watermelon juice: 8 oz blended</li>
                    <li>Have juice with a meal</li>
                  </ul>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card glow="yellow">
                  <CardTitle className="text-lg">Breakfast Combos</CardTitle>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    <li>Eggs + bacon + kachumbari</li>
                    <li>Eggs + leftover chicken + veg</li>
                    <li>Chia pudding + eggs on the side</li>
                  </ul>
                </Card>
                <Card glow="blue">
                  <CardTitle className="text-lg">Lunch Combos</CardTitle>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    <li>Chicken + rice + sukuma</li>
                    <li>Steak + rice/noodles + veg</li>
                    <li>Tacos + kachumbari + veg</li>
                  </ul>
                </Card>
                <Card glow="purple">
                  <CardTitle className="text-lg">Dinner Combos</CardTitle>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    <li>Salmon + rice + sukuma</li>
                    <li>Chicken + noodles + veg</li>
                    <li>Eggs + veg + small carb</li>
                  </ul>
                </Card>
              </div>
            </div>
          ) : null}

          {contentTab === "videos" ? (
            <div className="mt-6">
              <div>
                <h3 className="text-xl bg-gradient-to-r from-purple-bright to-pink-bright bg-clip-text text-transparent font-bold">
                  Video Library
                </h3>
                <p className="text-sm text-muted">
                  Your collection of workout videos. Saved locally.
                </p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {videoSlots.map((slot, index) => (
                  <Card key={slot} glow={(["pink", "purple", "blue", "yellow"] as const)[index % 4]} className="space-y-2">
                    <label className="text-sm font-bold text-purple-bright" htmlFor={slot}>
                      {slot}
                    </label>
                    <Input
                      id={slot}
                      placeholder="Paste video title or link"
                      value={videos[slot] ?? ""}
                      onChange={(event) =>
                        handleVideoChange(slot, event.target.value)
                      }
                    />
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="purple" onClick={handleSaveVideos}>{saveLabel}</Button>
              </div>
            </div>
          ) : null}

          {contentTab === "tracking" ? (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-xl bg-gradient-to-r from-pink-bright to-purple-bright bg-clip-text text-transparent font-bold">
                  Progress Tracking
                </h3>
                <p className="text-sm text-muted">
                  Capture your transformation. Photos are stored locally on your device.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card glow="pink" className="space-y-4">
                  <CardTitle>Cycle Tracker</CardTitle>
                  <div className="space-y-2">
                    <label htmlFor="start-date" className="text-sm font-bold text-purple-bright">
                      Period start date
                    </label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-light/50 to-purple-light/50">
                      <span className="block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                        Day 14 Photo
                      </span>
                      <p className="text-lg font-bold text-pink-bright">{day14}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-light/50 to-blue-light/50">
                      <span className="block text-xs font-bold uppercase tracking-[0.2em] text-muted">
                        Day 21 Photo
                      </span>
                      <p className="text-lg font-bold text-purple-bright">{day21}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    Best results: morning, empty stomach, same lighting.
                  </p>
                </Card>

                <Card glow="purple" className="space-y-4">
                  <CardTitle>Upload Progress Photo</CardTitle>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-purple/40 bg-gradient-to-br from-pink-light/20 to-purple-light/20 hover:border-purple hover:shadow-glow-purple transition-all duration-200 flex flex-col items-center justify-center gap-2"
                  >
                    <svg className="w-8 h-8 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-bold text-purple-bright">Add Photo</span>
                    <span className="text-xs text-muted">Click or tap to upload</span>
                  </button>
                </Card>
              </div>

              {photos.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-purple-bright">Your Gallery ({photos.length} photos)</h4>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {photos.map((photo, index) => (
                      <Card key={index} glow={(["pink", "purple", "blue", "yellow"] as const)[index % 4]} className="p-2 space-y-2">
                        <div className="relative group">
                          <img
                            src={photo.dataUrl}
                            alt={`Progress ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(index)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-bright/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-pink-bright"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="px-1">
                          <span className="text-xs font-bold text-purple-bright">{photo.label}</span>
                          <p className="text-xs text-muted">
                            {new Date(photo.date).toLocaleDateString()}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section id="mindset" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-yellow-bright to-pink-bright bg-clip-text text-transparent">
              Boss Battle Tips
            </h2>
            <p className="text-sm text-muted">No game overs. Just respawn and keep going.</p>
          </div>
          <Card glow="yellow" className="mt-6">
            <ul className="grid gap-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-light flex items-center justify-center text-pink-bright font-bold text-xs shrink-0">1</span>
                <span>Too hard? Do the easier version or fewer reps.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-light flex items-center justify-center text-purple-bright font-bold text-xs shrink-0">2</span>
                <span>Too tired? Pause the video for 30–60 seconds.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-light flex items-center justify-center text-blue-bright font-bold text-xs shrink-0">3</span>
                <span>Sharp pain? Stop and rest. Muscle burn is normal.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-light flex items-center justify-center text-yellow-bright font-bold text-xs shrink-0">4</span>
                <span>Missed a day? Continue the next day. No guilt.</span>
              </li>
            </ul>
          </Card>
        </section>

        <section id="checklist" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-purple-bright to-pink-bright bg-clip-text text-transparent">
              Daily Quests
            </h2>
            <p className="text-sm text-muted">Complete quests to level up. Progress saved daily.</p>
          </div>
          <Card glow="purple" className="mt-6 grid gap-3">
            {checklistItems.map((item, index) => {
              const colors = ["pink", "purple", "blue", "yellow"] as const;
              const color = colors[index % 4];
              return (
                <label
                  key={item}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm cursor-pointer transition-all duration-200 ${
                    checklist[index]
                      ? `bg-gradient-to-r from-${color}-light/50 to-white border-${color}/40`
                      : "bg-white/50 border-purple/10 hover:border-purple/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[index])}
                    onChange={(event) => handleChecklistChange(index, event.target.checked)}
                  />
                  <span className={checklist[index] ? "line-through text-muted" : "text-ink"}>
                    {item}
                  </span>
                  {checklist[index] && (
                    <span className="ml-auto text-xs font-bold text-purple-bright">+10 XP</span>
                  )}
                </label>
              );
            })}
          </Card>
          <div className="mt-4 text-center">
            <p className="text-sm font-bold text-purple-bright">
              Today&apos;s XP: {Object.values(checklist).filter(Boolean).length * 10} / {checklistItems.length * 10}
            </p>
          </div>
        </section>
      </main>

      <footer className="px-6 pb-12 pt-6 text-center text-xs text-muted md:px-12">
        <p className="bg-gradient-to-r from-pink to-purple to-blue bg-clip-text text-transparent font-medium">
          Your journey to glow up. Take rest days when needed.
        </p>
      </footer>
    </div>
  );
}
