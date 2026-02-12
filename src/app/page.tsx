"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checklistItems, planData, PlanKey, videoSlots } from "@/data/plans";

const VIDEO_STORAGE_KEY = "kashiVideos";
const CHECKLIST_STORAGE_KEY = "kashiChecklist";

type VideoMap = Record<string, string>;

type ChecklistMap = Record<number, boolean>;

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
  const [videos, setVideos] = useState<VideoMap>(defaultVideos);
  const [saveLabel, setSaveLabel] = useState("Save video list");
  const [checklist, setChecklist] = useState<ChecklistMap>({});
  const [startDate, setStartDate] = useState("");
  const [day14, setDay14] = useState("—");
  const [day21, setDay21] = useState("—");

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

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(225,104,55,0.24),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-44 -left-44 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(47,107,89,0.18),transparent_70%)]" />

      <header className="px-6 pb-16 pt-8 md:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-lg font-semibold">Kashi Recomp Routine</div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <a href="#schedule" className="hover:text-ink">
              Schedule
            </a>
            <a href="#routine" className="hover:text-ink">
              Daily Routine
            </a>
            <a href="#meals" className="hover:text-ink">
              Meals
            </a>
            <a href="#videos" className="hover:text-ink">
              Videos
            </a>
            <a href="#tracking" className="hover:text-ink">
              Tracking
            </a>
          </div>
        </nav>

        <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-highlight">
              Body recomposition · No equipment · Indoor
            </p>
            <h1 className="mt-3 text-3xl md:text-5xl">Slow, steady, and built for real life.</h1>
            <p className="mt-4 max-w-2xl text-base text-muted">
              A clear, ADHD-friendly plan that starts at your level, keeps you consistent, and
              protects your energy. You can adjust the details, but you never need to start over.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
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

          <Card className="bg-white/90">
            <CardTitle className="text-xl">Today’s Focus</CardTitle>
            <CardDescription>Pick one: jumpstart or maintenance.</CardDescription>
            <div className="mt-4 flex gap-2">
              <button
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  planKey === "jumpstart"
                    ? "bg-ink text-white"
                    : "bg-[#f3ece4] text-ink"
                }`}
                onClick={() => setPlanKey("jumpstart")}
              >
                Jumpstart (2 weeks)
              </button>
              <button
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  planKey === "maintenance"
                    ? "bg-ink text-white"
                    : "bg-[#f3ece4] text-ink"
                }`}
                onClick={() => setPlanKey("maintenance")}
              >
                Maintenance
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-[#f7efe6] p-4">
              <h3 className="text-lg font-semibold">{plan.title}</h3>
              <p className="text-sm text-muted">{plan.description}</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {plan.pills.map((pill) => (
                  <li key={pill} className="rounded-full bg-white px-3 py-2">
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
            <h2 className="text-2xl">Your Weekly Map</h2>
            <p className="text-sm text-muted">Switch between jumpstart and maintenance.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plan.week.map((item) => {
              const slots = item.videoSlots ?? [];
              return (
                <Card key={`${item.day}-${item.focus}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight">
                    {item.day}
                  </p>
                  <CardTitle className="mt-2 text-lg">{item.focus}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                  {slots.length > 0 ? (
                    <div className="mt-3 rounded-xl bg-[#faf6f1] px-3 py-2 text-xs text-muted">
                      <div className="grid gap-2">
                        {slots.map((slot) => {
                          const value = videos[slot] ?? "";
                          const isLink = value.startsWith("http");
                          return (
                            <div key={slot} className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                                {slot}
                              </span>
                              {value ? (
                                isLink ? (
                                  <a
                                    href={value}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-highlight"
                                  >
                                    Open video
                                  </a>
                                ) : (
                                  <span>{value}</span>
                                )
                              ) : (
                                <span>Add video in the library below.</span>
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
            <h2 className="text-2xl">Daily Routine (7 AM Workout)</h2>
            <p className="text-sm text-muted">Adjust times to your class schedule.</p>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              { time: "5:45", title: "Wake up + water", note: "Bathroom, a few sips of water." },
              { time: "6:00", title: "Chia pudding", note: "Keep honey light; add protein if you can." },
              { time: "6:15", title: "Watermelon juice", note: "8 oz blended, with a meal if possible." },
              { time: "6:30", title: "Warm-up", note: "5 min, protect your joints." },
              { time: "6:35", title: "Main workout", note: "15–25 min. Pause and modify freely." },
              { time: "6:55", title: "Cool-down stretch", note: "12 min. Reduces soreness." },
              { time: "7:30", title: "Breakfast", note: "Eggs + protein + veggies." },
              { time: "12:00", title: "Lunch", note: "Protein + fist-sized carbs + veggies." },
              { time: "18:00", title: "Dinner", note: "Protein + veggies + smaller carb portion." },
              { time: "21:30", title: "Wind down", note: "Prep clothes + chia for tomorrow." },
            ].map((item) => (
              <Card key={item.time} className="flex flex-col gap-2 md:flex-row md:items-center">
                <span className="text-sm font-semibold text-highlight md:w-20">{item.time}</span>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.note}</CardDescription>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="meals" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl">Meals That Fit Your Food List</h2>
            <p className="text-sm text-muted">Simple portions and repeatable combos.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardTitle className="text-lg">Portion guide</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Protein: palm-sized</li>
                <li>Carbs: fist-sized</li>
                <li>Fats: thumb-sized</li>
                <li>Veggies: fill the rest</li>
              </ul>
            </Card>
            <Card>
              <CardTitle className="text-lg">Foods you already have</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Eggs, chicken, steak, salmon</li>
                <li>Mincemeat tacos + kachumbari</li>
                <li>Rice, noodles, sukuma wiki</li>
                <li>Bacon/sausages (keep portions modest)</li>
              </ul>
            </Card>
            <Card>
              <CardTitle className="text-lg">Daily hydration</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Water: 2–3 liters</li>
                <li>Watermelon juice: 8 oz blended</li>
                <li>Have juice with a meal</li>
              </ul>
            </Card>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardTitle className="text-lg">Breakfast ideas</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Eggs + bacon + kachumbari</li>
                <li>Eggs + leftover chicken + veg</li>
                <li>Chia pudding + eggs on the side</li>
              </ul>
            </Card>
            <Card>
              <CardTitle className="text-lg">Lunch ideas</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Chicken + rice + sukuma</li>
                <li>Steak + rice/noodles + veg</li>
                <li>Tacos + kachumbari + veg</li>
              </ul>
            </Card>
            <Card>
              <CardTitle className="text-lg">Dinner ideas</CardTitle>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Salmon + rice + sukuma</li>
                <li>Chicken + noodles + veg</li>
                <li>Eggs + veg + small carb</li>
              </ul>
            </Card>
          </div>
        </section>

        <section id="videos" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl">Your Video Library</h2>
            <p className="text-sm text-muted">Paste your video titles or links. Saved locally.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {videoSlots.map((slot) => (
              <Card key={slot} className="space-y-2">
                <label className="text-sm font-semibold" htmlFor={slot}>
                  {slot}
                </label>
                <Input
                  id={slot}
                  placeholder="Paste video title or link"
                  value={videos[slot] ?? ""}
                  onChange={(event) => handleVideoChange(slot, event.target.value)}
                />
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={handleSaveVideos}>{saveLabel}</Button>
          </div>
        </section>

        <section id="tracking" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl">Photo Tracking</h2>
            <p className="text-sm text-muted">Enter your period start date to auto-calc Day 14 and Day 21.</p>
          </div>
          <Card className="mt-6 max-w-xl space-y-4">
            <div className="space-y-2">
              <label htmlFor="start-date" className="text-sm font-semibold">
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
              <div>
                <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Day 14
                </span>
                <p className="text-base font-semibold text-highlight">{day14}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Day 21
                </span>
                <p className="text-base font-semibold text-highlight">{day21}</p>
              </div>
            </div>
            <p className="text-sm text-muted">
              Take photos in the morning on an empty stomach, same lighting.
            </p>
          </Card>
        </section>

        <section id="mindset" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl">When It Feels Hard</h2>
            <p className="text-sm text-muted">No restarts. Just modify and keep moving.</p>
          </div>
          <Card className="mt-6">
            <ul className="grid gap-2 text-sm text-muted">
              <li>Too hard? Do the easier version or fewer reps.</li>
              <li>Too tired? Pause the video for 30–60 seconds.</li>
              <li>Sharp pain? Stop and rest. Muscle burn is normal.</li>
              <li>Missed a day? Continue the next day. No guilt.</li>
            </ul>
          </Card>
        </section>

        <section id="checklist" className="px-6 py-12 md:px-12">
          <div>
            <h2 className="text-2xl">Daily Checklist</h2>
            <p className="text-sm text-muted">Check off what you complete. Saved by date.</p>
          </div>
          <Card className="mt-6 grid gap-3">
            {checklistItems.map((item, index) => (
              <label
                key={item}
                className="flex items-center gap-3 rounded-xl border border-black/10 bg-[#faf6f1] px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checklist[index])}
                  onChange={(event) => handleChecklistChange(index, event.target.checked)}
                  className="h-4 w-4 accent-highlight"
                />
                <span>{item}</span>
              </label>
            ))}
          </Card>
        </section>
      </main>

      <footer className="px-6 pb-12 pt-6 text-center text-xs text-muted md:px-12">
        This plan supports consistency and recovery. If you feel unwell or notice pain, pause and
        rest. If needed, check in with a health professional.
      </footer>
    </div>
  );
}
