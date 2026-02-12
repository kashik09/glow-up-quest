export type PlanKey = "jumpstart" | "maintenance";

export const videoSlots = [
  "Monday: Full Body HIIT",
  "Tuesday: Glutes/Lower Body",
  "Wednesday: Dance Cardio",
  "Thursday: Upper Body",
  "Thursday: Handstand Tutorial",
  "Friday: Abs/Core",
  "Saturday: Full Body",
  "Saturday: Cartwheel Tutorial",
  "Stretch/Cooldown (Workout Days)",
  "Stretch (Sunday)",
] as const;

export const checklistItems = [
  "Water (2-3L)",
  "Watermelon juice (8 oz)",
  "Chia pudding",
  "Warm-up",
  "Workout",
  "Cool-down stretch",
  "Protein at every meal",
  "Veggies",
  "Sleep 7-8 hours",
] as const;

export const planData = {
  jumpstart: {
    title: "Jumpstart Mode",
    description: "6 days on, 1 day off. Short sessions. Consistency over perfection.",
    pills: ["Warm-up + workout + stretch", "Protein every meal", "Watermelon juice with a meal"],
    week: [
      {
        day: "Monday",
        focus: "Full Body HIIT",
        detail: "Warm-up → HIIT → Stretch",
        videoSlots: ["Monday: Full Body HIIT", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Tuesday",
        focus: "Glutes + Lower Body",
        detail: "Booty workout + stretch",
        videoSlots: ["Tuesday: Glutes/Lower Body", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Wednesday",
        focus: "Dance Cardio",
        detail: "Keep it fun and light",
        videoSlots: ["Wednesday: Dance Cardio", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Thursday",
        focus: "Upper Body + Handstand",
        detail: "Upper body video + handstand basics",
        videoSlots: [
          "Thursday: Upper Body",
          "Thursday: Handstand Tutorial",
          "Stretch/Cooldown (Workout Days)",
        ],
      },
      {
        day: "Friday",
        focus: "Abs + Core",
        detail: "Core video + stretch",
        videoSlots: ["Friday: Abs/Core", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Saturday",
        focus: "Full Body + Cartwheel",
        detail: "Full body video + cartwheel practice",
        videoSlots: [
          "Saturday: Full Body",
          "Saturday: Cartwheel Tutorial",
          "Stretch/Cooldown (Workout Days)",
        ],
      },
      {
        day: "Sunday",
        focus: "Rest Day",
        detail: "Gentle stretch only",
        videoSlots: ["Stretch (Sunday)"],
      },
    ],
  },
  maintenance: {
    title: "Maintenance Mode",
    description: "2–3 sessions per week. Same structure, less volume.",
    pills: ["Pick your favorite videos", "Still warm-up + stretch", "Focus on recovery"],
    week: [
      {
        day: "Monday",
        focus: "Full Body",
        detail: "Warm-up → workout → stretch",
        videoSlots: ["Monday: Full Body HIIT", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Tuesday",
        focus: "Rest or walk",
        detail: "Optional light movement",
      },
      {
        day: "Wednesday",
        focus: "Glutes or Dance",
        detail: "Pick the one you enjoy",
        videoSlots: [
          "Tuesday: Glutes/Lower Body",
          "Wednesday: Dance Cardio",
          "Stretch/Cooldown (Workout Days)",
        ],
      },
      {
        day: "Thursday",
        focus: "Rest or handstand basics",
        detail: "10–15 min skill work",
        videoSlots: ["Thursday: Handstand Tutorial", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Friday",
        focus: "Core or Full Body",
        detail: "Short session + stretch",
        videoSlots: ["Friday: Abs/Core", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Saturday",
        focus: "Rest",
        detail: "Stretch or chill",
      },
      {
        day: "Sunday",
        focus: "Reset",
        detail: "Prepare for the week",
        videoSlots: ["Stretch (Sunday)"],
      },
    ],
  },
} satisfies Record<PlanKey, {
  title: string;
  description: string;
  pills: string[];
  week: {
    day: string;
    focus: string;
    detail: string;
    videoSlots?: (typeof videoSlots)[number][];
  }[];
}>;
