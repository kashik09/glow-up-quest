"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const routineItems = [
  { time: "5:45", title: "Wake up + water", note: "Bathroom, a few sips of water.", emoji: "🌅", color: "pink" },
  { time: "6:00", title: "Chia pudding", note: "Keep honey light; add protein if you can.", emoji: "🥣", color: "purple" },
  { time: "6:15", title: "Watermelon juice", note: "8 oz blended, with a meal if possible.", emoji: "🍉", color: "blue" },
  { time: "6:30", title: "Warm-up", note: "5 min, protect your joints.", emoji: "🔥", color: "yellow" },
  { time: "6:35", title: "Main workout", note: "15–25 min. Pause and modify freely.", emoji: "💪", color: "pink" },
  { time: "6:55", title: "Cool-down stretch", note: "12 min. Reduces soreness.", emoji: "🧘", color: "purple" },
  { time: "7:30", title: "Breakfast", note: "Eggs + protein + veggies.", emoji: "🍳", color: "blue" },
  { time: "12:00", title: "Lunch", note: "Protein + fist-sized carbs + veggies.", emoji: "🥗", color: "yellow" },
  { time: "18:00", title: "Dinner", note: "Protein + veggies + smaller carb portion.", emoji: "🍽️", color: "pink" },
  { time: "21:30", title: "Wind down", note: "Prep clothes + chia for tomorrow.", emoji: "🌙", color: "purple" },
];

export default function RoutinePage() {
  return (
    <div className="px-6 py-8 md:px-12 max-w-4xl mx-auto">
      <section className="animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-bright to-yellow-bright bg-clip-text text-transparent">
          Daily Power-Ups ⚡
        </h1>
        <p className="text-muted mt-2">Your daily quest schedule. Adjust times to fit your life.</p>
      </section>

      {/* Timeline */}
      <section className="mt-8 relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink via-purple via-blue to-yellow hidden md:block" />

        <div className="space-y-4">
          {routineItems.map((item, index) => (
            <div
              key={item.time}
              className="animate-slide-in-right flex gap-4 items-start"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Time bubble */}
              <div className={`hidden md:flex w-16 h-16 rounded-full items-center justify-center text-2xl shrink-0 z-10 ${
                item.color === "pink" ? "bg-pink-light" :
                item.color === "purple" ? "bg-purple-light" :
                item.color === "blue" ? "bg-blue-light" : "bg-yellow-light"
              }`}>
                {item.emoji}
              </div>

              {/* Card */}
              <Card
                glow={item.color as "pink" | "purple" | "blue" | "yellow"}
                className="flex-1 hover:scale-102 transition-transform duration-300"
              >
                <div className="flex items-start gap-3">
                  <span className="md:hidden text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-lg font-bold ${
                        item.color === "pink" ? "text-pink-bright" :
                        item.color === "purple" ? "text-purple-bright" :
                        item.color === "blue" ? "text-blue-bright" : "text-yellow-bright"
                      }`}>
                        {item.time}
                      </span>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">{item.note}</CardDescription>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mt-12 animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <Card glow="yellow">
          <CardTitle className="text-xl">Pro Tips 💡</CardTitle>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-pink-bright">•</span>
              <span>Lay out workout clothes the night before - no decision fatigue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-bright">•</span>
              <span>Pre-make chia pudding before bed so it&apos;s ready to eat</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-bright">•</span>
              <span>Set phone alarms for each time slot until it becomes habit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-bright">•</span>
              <span>Times are flexible - adjust based on your class/work schedule</span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
