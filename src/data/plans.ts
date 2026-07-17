export type PlanKey = "jumpstart" | "maintenance";

// Default video links - curated workout videos (verified URLs)
export const defaultVideoLinks: Record<string, string> = {
  "Warm-up (Workout Days)": "https://www.youtube.com/watch?v=isP6_uU34as", // MadFit 5 MIN WARM UP
  "Monday: Full Body HIIT": "https://www.youtube.com/watch?v=fH_MCHy0jH4", // MadFit 20 MIN FULL BODY HIIT
  "Tuesday: Glutes/Lower Body": "https://www.youtube.com/watch?v=0_uF1pG4nSg", // MadFit Booty Workout
  "Wednesday: Dance Cardio": "https://www.youtube.com/watch?v=6VzVnE8l7iY", // MadFit Throwbacks Dance Party pt.2
  "Thursday: Upper Body": "https://www.youtube.com/watch?v=X3q5e1V4_68", // MadFit Upper Body
  "Thursday: Handstand Tutorial": "https://www.youtube.com/watch?v=KpNwJgIxEWI", // Meli Handstand Beginners
  "Friday: Abs/Core": "https://www.youtube.com/watch?v=2pLT-olgUJs", // MadFit Total Core
  "Saturday: Full Body": "https://www.youtube.com/watch?v=fH_MCHy0jH4", // MadFit Full Body HIIT
  "Saturday: Cartwheel Tutorial": "https://www.youtube.com/watch?v=R9I1S5B9m6w", // Rylie Shaw Cartwheel
  "Stretch/Cooldown (Workout Days)": "https://www.youtube.com/watch?v=EN_f7E68Z54", // MadFit 12 Min Daily Stretch
  "Stretch (Sunday)": "https://www.youtube.com/watch?v=EN_f7E68Z54", // MadFit stretch for rest day
};

// Video metadata for display
export const videoMetadata: Record<string, { title: string; creator: string; duration: string }> = {
  "Warm-up (Workout Days)": {
    title: "5 MIN WARM UP FOR AT HOME WORKOUTS (Full Body)",
    creator: "MadFit",
    duration: "5 min",
  },
  "Monday: Full Body HIIT": {
    title: "20 MIN FULL BODY HIIT - All Standing, No Repeats",
    creator: "MadFit",
    duration: "20 min",
  },
  "Tuesday: Glutes/Lower Body": {
    title: "THE BEST AT HOME BOOTY WORKOUT (No Equipment)",
    creator: "MadFit",
    duration: "20 min",
  },
  "Wednesday: Dance Cardio": {
    title: "15 MIN THROWBACKS DANCE PARTY WORKOUT (pt. 2)",
    creator: "MadFit",
    duration: "15 min",
  },
  "Thursday: Upper Body": {
    title: "15 MIN UPPER BODY WORKOUT (No Equipment)",
    creator: "MadFit",
    duration: "15 min",
  },
  "Thursday: Handstand Tutorial": {
    title: "Handstand For Beginners",
    creator: "Meli",
    duration: "10 min",
  },
  "Friday: Abs/Core": {
    title: "20 MIN TOTAL CORE/AB WORKOUT (No Equipment)",
    creator: "MadFit",
    duration: "20 min",
  },
  "Saturday: Full Body": {
    title: "20 MIN FULL BODY HOME WORKOUT",
    creator: "MadFit",
    duration: "20 min",
  },
  "Saturday: Cartwheel Tutorial": {
    title: "How to EASILY do a cartwheel! (Tutorial)",
    creator: "Rylie Shaw",
    duration: "5 min",
  },
  "Stretch/Cooldown (Workout Days)": {
    title: "12 MIN DAILY STRETCH - for tight muscles & mobility",
    creator: "MadFit",
    duration: "12 min",
  },
  "Stretch (Sunday)": {
    title: "15 MIN FULL BODY STRETCH - Mobility & Flexibility",
    creator: "growingannanas",
    duration: "15 min",
  },
};

export const videoSlots = [
  "Warm-up (Workout Days)",
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

// Base items that apply every day
export const dailyBaseItems = [
  "Water (2-3L)",
  "Watermelon juice (8 oz)",
  "Chia pudding",
  "Protein at every meal",
  "Veggies",
  "Sleep 7-8 hours",
] as const;

// Workout day specific items
export const workoutItems = [
  "Warm-up",
  "Workout",
  "Cool-down stretch",
] as const;

// Rest day specific items
export const restDayItems = [
  "Gentle stretch",
  "Self-care moment",
  "Prep for tomorrow",
] as const;

// Combined for workout days (legacy export)
export const checklistItems = [
  ...dailyBaseItems.slice(0, 3),
  ...workoutItems,
  ...dailyBaseItems.slice(3),
] as const;

// Helper to get checklist items for a specific day type
export function getChecklistForDay(isRestDay: boolean): string[] {
  const base = [...dailyBaseItems];
  const daySpecific = isRestDay ? [...restDayItems] : [...workoutItems];
  // Insert day-specific items after the first 3 base items
  return [...base.slice(0, 3), ...daySpecific, ...base.slice(3)];
}

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
        videoSlots: ["Warm-up (Workout Days)", "Monday: Full Body HIIT", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Tuesday",
        focus: "Glutes + Lower Body",
        detail: "Warm-up → Booty workout → Stretch",
        videoSlots: ["Warm-up (Workout Days)", "Tuesday: Glutes/Lower Body", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Wednesday",
        focus: "Dance Cardio",
        detail: "Warm-up → Dance → Stretch",
        videoSlots: ["Warm-up (Workout Days)", "Wednesday: Dance Cardio", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Thursday",
        focus: "Upper Body + Handstand",
        detail: "Warm-up → Upper body → Handstand → Stretch",
        videoSlots: [
          "Warm-up (Workout Days)",
          "Thursday: Upper Body",
          "Thursday: Handstand Tutorial",
          "Stretch/Cooldown (Workout Days)",
        ],
      },
      {
        day: "Friday",
        focus: "Abs + Core",
        detail: "Warm-up → Core → Stretch",
        videoSlots: ["Warm-up (Workout Days)", "Friday: Abs/Core", "Stretch/Cooldown (Workout Days)"],
      },
      {
        day: "Saturday",
        focus: "Full Body + Cartwheel",
        detail: "Warm-up → Full body → Cartwheel → Stretch",
        videoSlots: [
          "Warm-up (Workout Days)",
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
    title: "Recomp Mode",
    description: "3-day split for sustainability. After your 2-week jumpstart.",
    pills: ["Lower/Upper/Full split", "Skill work included", "Focus on recovery"],
    week: [
      {
        day: "Monday",
        focus: "Lower Body",
        detail: "Warm-up → Handstand Drills → Booty → Stretch",
        videoSlots: [
          "Warm-up (Workout Days)",
          "Thursday: Handstand Tutorial",
          "Tuesday: Glutes/Lower Body",
          "Stretch/Cooldown (Workout Days)",
        ],
      },
      {
        day: "Tuesday",
        focus: "Rest Day",
        detail: "Recovery & light movement",
      },
      {
        day: "Wednesday",
        focus: "Upper Body",
        detail: "Warm-up → Cartwheel Practice → Upper Body → Stretch",
        videoSlots: [
          "Warm-up (Workout Days)",
          "Saturday: Cartwheel Tutorial",
          "Thursday: Upper Body",
          "Stretch/Cooldown (Workout Days)",
        ],
      },
      {
        day: "Thursday",
        focus: "Rest Day",
        detail: "Recovery & mobility",
      },
      {
        day: "Friday",
        focus: "Full Body",
        detail: "Warm-up → HIIT → Core → Stretch",
        videoSlots: [
          "Warm-up (Workout Days)",
          "Monday: Full Body HIIT",
          "Friday: Abs/Core",
          "Stretch/Cooldown (Workout Days)",
        ],
      },
      {
        day: "Saturday",
        focus: "Rest Day",
        detail: "Active recovery or chill",
      },
      {
        day: "Sunday",
        focus: "Rest Day",
        detail: "Prep for the week ahead",
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
