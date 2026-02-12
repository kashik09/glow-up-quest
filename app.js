const planData = {
  jumpstart: {
    title: "Jumpstart Mode",
    description: "6 days on, 1 day off. Short sessions. Consistency over perfection.",
    pills: ["Warm-up + workout + stretch", "Protein every meal", "Watermelon juice with a meal"],
    week: [
      {
        day: "Monday",
        focus: "Full Body HIIT",
        detail: "Warm-up → HIIT → Stretch",
      },
      {
        day: "Tuesday",
        focus: "Glutes + Lower Body",
        detail: "Booty workout + stretch",
      },
      {
        day: "Wednesday",
        focus: "Dance Cardio",
        detail: "Keep it fun and light",
      },
      {
        day: "Thursday",
        focus: "Upper Body + Handstand",
        detail: "Upper body video + handstand basics",
      },
      {
        day: "Friday",
        focus: "Abs + Core",
        detail: "Core video + stretch",
      },
      {
        day: "Saturday",
        focus: "Full Body + Cartwheel",
        detail: "Full body video + cartwheel practice",
      },
      {
        day: "Sunday",
        focus: "Rest Day",
        detail: "Gentle stretch only",
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
      },
      {
        day: "Thursday",
        focus: "Rest or handstand basics",
        detail: "10–15 min skill work",
      },
      {
        day: "Friday",
        focus: "Core or Full Body",
        detail: "Short session + stretch",
      },
      {
        day: "Saturday",
        focus: "Rest",
        detail: "Stretch or chill",
      },
      {
        day: "Sunday",
        focus: "Rest",
        detail: "Reset for the week",
      },
    ],
  },
};

const videoSlots = [
  "Monday: Full Body HIIT",
  "Tuesday: Glutes/Lower Body",
  "Wednesday: Dance Cardio",
  "Thursday: Upper Body",
  "Thursday: Handstand Tutorial",
  "Friday: Abs/Core",
  "Saturday: Full Body",
  "Saturday: Cartwheel Tutorial",
  "Stretch/Cooldown",
];

const checklistItems = [
  "Water (2-3L)",
  "Watermelon juice (8 oz)",
  "Chia pudding",
  "Warm-up",
  "Workout",
  "Cool-down stretch",
  "Protein at every meal",
  "Veggies",
  "Sleep 7-8 hours",
];

const focusCard = document.getElementById("focus-card");
const weekGrid = document.getElementById("week-grid");
const toggleButtons = document.querySelectorAll(".toggle-btn");
const videoGrid = document.getElementById("video-grid");
const saveVideos = document.getElementById("save-videos");
const dailyChecklist = document.getElementById("daily-checklist");
const startDateInput = document.getElementById("start-date");
const day14 = document.getElementById("day14");
const day21 = document.getElementById("day21");

function renderPlan(planKey) {
  const plan = planData[planKey];
  focusCard.innerHTML = `
    <h3>${plan.title}</h3>
    <p>${plan.description}</p>
    <ul class="pill-list">
      ${plan.pills.map((pill) => `<li>${pill}</li>`).join("")}
    </ul>
  `;

  weekGrid.innerHTML = plan.week
    .map(
      (item) => `
      <div class="day-card">
        <div class="tagline">${item.day}</div>
        <h3>${item.focus}</h3>
        <p class="muted">${item.detail}</p>
      </div>
    `
    )
    .join("");
}

function setupToggle() {
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderPlan(btn.dataset.plan);
    });
  });
}

function renderVideoInputs() {
  const saved = JSON.parse(localStorage.getItem("kashiVideos") || "{}");
  videoGrid.innerHTML = videoSlots
    .map(
      (slot, index) => `
      <div class="card video-card">
        <label for="video-${index}">${slot}</label>
        <input
          id="video-${index}"
          type="text"
          placeholder="Paste video title or link"
          value="${saved[slot] ? saved[slot].replace(/"/g, "&quot;") : ""}"
        />
      </div>
    `
    )
    .join("");
}

function saveVideoInputs() {
  const data = {};
  videoSlots.forEach((slot, index) => {
    const input = document.getElementById(`video-${index}`);
    data[slot] = input.value.trim();
  });
  localStorage.setItem("kashiVideos", JSON.stringify(data));
  saveVideos.textContent = "Saved!";
  setTimeout(() => {
    saveVideos.textContent = "Save video list";
  }, 1500);
}

function renderChecklist() {
  const todayKey = new Date().toISOString().split("T")[0];
  const saved = JSON.parse(localStorage.getItem("kashiChecklist") || "{}");
  const todayData = saved[todayKey] || {};

  dailyChecklist.innerHTML = checklistItems
    .map(
      (item, index) => `
      <label class="check-item">
        <input type="checkbox" data-index="${index}" ${
          todayData[index] ? "checked" : ""
        } />
        <span>${item}</span>
      </label>
    `
    )
    .join("");

  dailyChecklist.querySelectorAll("input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const data = JSON.parse(localStorage.getItem("kashiChecklist") || "{}");
      data[todayKey] = data[todayKey] || {};
      data[todayKey][checkbox.dataset.index] = checkbox.checked;
      localStorage.setItem("kashiChecklist", JSON.stringify(data));
    });
  });
}

function addDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function setupTracking() {
  startDateInput.addEventListener("change", (event) => {
    const value = event.target.value;
    if (!value) {
      day14.textContent = "—";
      day21.textContent = "—";
      return;
    }

    const baseDate = new Date(`${value}T00:00:00`);
    const day14Date = addDays(baseDate, 13);
    const day21Date = addDays(baseDate, 20);
    day14.textContent = formatDate(day14Date);
    day21.textContent = formatDate(day21Date);
  });
}

renderPlan("jumpstart");
setupToggle();
renderVideoInputs();
saveVideos.addEventListener("click", saveVideoInputs);
renderChecklist();
setupTracking();
