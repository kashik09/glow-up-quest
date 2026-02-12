"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { videoSlots } from "@/data/plans";

const VIDEO_STORAGE_KEY = "glowUpVideos";
const PHOTOS_STORAGE_KEY = "glowUpPhotos";
const CYCLE_STORAGE_KEY = "glowUpCycle";

type VideoMap = Record<string, string>;
type PhotoEntry = {
  dataUrl: string;
  date: string;
  label: string;
  cycleDay?: number;
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

function isSameDay(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString();
}

export default function TrackerPage() {
  const [tab, setTab] = useState<"photos" | "meals" | "videos">("photos");
  const [videos, setVideos] = useState<VideoMap>(defaultVideos);
  const [saveLabel, setSaveLabel] = useState("Save");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [startDate, setStartDate] = useState("");
  const [day14Date, setDay14Date] = useState<Date | null>(null);
  const [day21Date, setDay21Date] = useState<Date | null>(null);
  const [photoLabel, setPhotoLabel] = useState<string>("Progress");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedVideos = window.localStorage.getItem(VIDEO_STORAGE_KEY);
    if (storedVideos) setVideos({ ...defaultVideos, ...JSON.parse(storedVideos) });

    const storedPhotos = window.localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (storedPhotos) setPhotos(JSON.parse(storedPhotos));

    const storedCycle = window.localStorage.getItem(CYCLE_STORAGE_KEY);
    if (storedCycle) setStartDate(storedCycle);
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
  };

  const handleSaveVideos = () => {
    window.localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
    setSaveLabel("Saved! ✓");
    setTimeout(() => setSaveLabel("Save"), 1400);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
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

  const isToday14 = day14Date && isSameDay(new Date(), day14Date);
  const isToday21 = day21Date && isSameDay(new Date(), day21Date);

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
      <section className="animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-bright to-purple-bright bg-clip-text text-transparent">
          Progress Tracker 📊
        </h1>
        <p className="text-muted mt-2">Photos, meals, and video library - all in one place.</p>
      </section>

      {/* Tabs */}
      <section className="mt-6 flex flex-wrap gap-3">
        {[
          { key: "photos", label: "📸 Photos", color: "pink" },
          { key: "meals", label: "🥗 Meals", color: "blue" },
          { key: "videos", label: "🎬 Videos", color: "purple" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
              tab === t.key
                ? t.color === "pink"
                  ? "bg-gradient-to-r from-pink to-pink-bright text-white shadow-glow scale-105"
                  : t.color === "blue"
                  ? "bg-gradient-to-r from-blue to-blue-bright text-white shadow-glow-blue scale-105"
                  : "bg-gradient-to-r from-purple to-purple-bright text-white shadow-glow-purple scale-105"
                : "bg-white/50 text-muted hover:bg-white/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </section>

      {/* Photos Tab */}
      {tab === "photos" && (
        <div className="mt-8 space-y-8 animate-fade-in">
          {/* Cycle Tracker + Upload Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cycle Tracker */}
            <Card glow="pink" className="space-y-4">
              <CardTitle className="flex items-center gap-2">
                🩸 Cycle Tracker
              </CardTitle>
              <CardDescription>
                Enter your period start date to auto-calculate photo days.
              </CardDescription>
              <div className="space-y-2">
                <label htmlFor="start-date" className="text-sm font-bold text-purple-bright">
                  Period Start Date
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  isToday14
                    ? "bg-gradient-to-br from-pink to-purple text-white shadow-glow animate-glow-pulse"
                    : "bg-gradient-to-br from-pink-light/50 to-purple-light/50"
                }`}>
                  <span className={`block text-xs font-bold uppercase tracking-[0.2em] ${isToday14 ? "text-white/80" : "text-muted"}`}>
                    Day 14 Photo
                  </span>
                  <p className={`text-xl font-bold ${isToday14 ? "text-white" : "text-pink-bright"}`}>
                    {day14Date ? formatDate(day14Date) : "—"}
                  </p>
                  {isToday14 && <p className="text-xs mt-1 text-white/90">📸 TODAY! Take your photo</p>}
                </div>
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  isToday21
                    ? "bg-gradient-to-br from-purple to-blue text-white shadow-glow-purple animate-glow-pulse"
                    : "bg-gradient-to-br from-purple-light/50 to-blue-light/50"
                }`}>
                  <span className={`block text-xs font-bold uppercase tracking-[0.2em] ${isToday21 ? "text-white/80" : "text-muted"}`}>
                    Day 21 Photo
                  </span>
                  <p className={`text-xl font-bold ${isToday21 ? "text-white" : "text-purple-bright"}`}>
                    {day21Date ? formatDate(day21Date) : "—"}
                  </p>
                  {isToday21 && <p className="text-xs mt-1 text-white/90">📸 TODAY! Take your photo</p>}
                </div>
              </div>
              <p className="text-xs text-muted">
                💡 Best results: morning, empty stomach, same lighting.
              </p>
            </Card>

            {/* Upload Section */}
            <Card glow="purple" className="space-y-4">
              <CardTitle>📤 Upload Progress Photo</CardTitle>
              <CardDescription>
                {isToday14
                  ? "🎉 It's Day 14! Upload your mid-cycle photo."
                  : isToday21
                  ? "🎉 It's Day 21! Upload your pre-period photo."
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
                    className={`rounded-xl border-2 border-dashed p-4 transition-all duration-300 hover:scale-105 ${
                      btn.active
                        ? "border-purple bg-gradient-to-br from-pink-light/50 to-purple-light/50 shadow-glow"
                        : "border-purple/30 hover:border-purple/60"
                    }`}
                  >
                    <span className="text-2xl">📸</span>
                    <p className="text-sm font-bold text-purple-bright mt-1">{btn.label}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-bright">
                Your Gallery ({photos.length} photos)
              </h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo, index) => (
                  <Card
                    key={index}
                    glow={(["pink", "purple", "blue", "yellow"] as const)[index % 4]}
                    className="p-2 space-y-2 animate-bounce-in hover:scale-105 transition-transform"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative group">
                      <img
                        src={photo.dataUrl}
                        alt={`Progress ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeletePhoto(index)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-bright/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-pink-bright"
                      >
                        ✕
                      </button>
                      <span className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${
                        photo.label === "Day 14"
                          ? "bg-pink-bright text-white"
                          : photo.label === "Day 21"
                          ? "bg-purple-bright text-white"
                          : "bg-blue-bright text-white"
                      }`}>
                        {photo.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted px-1">
                      {new Date(photo.date).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meals Tab */}
      {tab === "meals" && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-3">
            <Card glow="blue">
              <CardTitle>📏 Portion Guide</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm">
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink"></span>Protein: palm-sized</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple"></span>Carbs: fist-sized</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue"></span>Fats: thumb-sized</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow"></span>Veggies: fill the rest</li>
              </ul>
            </Card>
            <Card glow="purple">
              <CardTitle>🥩 Your Inventory</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Eggs, chicken, steak, salmon</li>
                <li>Mincemeat tacos + kachumbari</li>
                <li>Rice, noodles, sukuma wiki</li>
                <li>Bacon/sausages (modest portions)</li>
              </ul>
            </Card>
            <Card glow="pink">
              <CardTitle>💧 Hydration</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Water: 2–3 liters daily</li>
                <li>Watermelon juice: 8 oz blended</li>
                <li>Have juice with a meal</li>
              </ul>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card glow="yellow">
              <CardTitle>🍳 Breakfast Combos</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Eggs + bacon + kachumbari</li>
                <li>Eggs + leftover chicken + veg</li>
                <li>Chia pudding + eggs on the side</li>
              </ul>
            </Card>
            <Card glow="blue">
              <CardTitle>🥗 Lunch Combos</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Chicken + rice + sukuma</li>
                <li>Steak + rice/noodles + veg</li>
                <li>Tacos + kachumbari + veg</li>
              </ul>
            </Card>
            <Card glow="purple">
              <CardTitle>🍽️ Dinner Combos</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
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
          <p className="text-sm text-muted mb-6">
            Paste your workout video links here. They&apos;ll show up in your Schedule.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {videoSlots.map((slot, index) => (
              <Card
                key={slot}
                glow={(["pink", "purple", "blue", "yellow"] as const)[index % 4]}
                className="space-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <label className="text-sm font-bold text-purple-bright" htmlFor={slot}>
                  {slot}
                </label>
                <Input
                  id={slot}
                  placeholder="Paste video link or title"
                  value={videos[slot] ?? ""}
                  onChange={(e) => handleVideoChange(slot, e.target.value)}
                />
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="purple" onClick={handleSaveVideos}>
              {saveLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
