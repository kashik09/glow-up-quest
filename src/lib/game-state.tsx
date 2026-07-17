"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

// ============== TYPES ==============

export type PetStage = "egg" | "blob" | "creature" | "beast" | "legendary";
export type AvatarMood = "tired" | "okay" | "good" | "great" | "glowing";
export type CoachType = "hype" | "gentle" | "tough" | "chaos";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  secret?: boolean;
  unlockedAt?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: "power-up" | "cosmetic" | "pet-item" | "room-item";
  quantity: number;
};

export type PetState = {
  name: string;
  emoji: string;
  stage: PetStage;
  happiness: number; // 0-100
  energy: number; // 0-100
  fedToday: boolean;
  totalFeedings: number;
};

export type RoomItem = {
  id: string;
  name: string;
  position?: { x: number; y: number };
  owned: boolean;
};

export type WeeklyBoss = {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  defeated: boolean;
  weekStart: string;
};

export type GameState = {
  // Core progression
  totalXp: number;
  level: number;
  coins: number;

  // Streaks
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  streakShields: number;

  // Combo
  currentCombo: number;
  bestCombo: number;

  // Pet
  pet: PetState | null;
  unlockedPets: string[];

  // Avatar
  avatarMood: AvatarMood;
  unlockedOutfits: string[];
  currentOutfit: string;
  unlockedHair: string[];
  currentHair: string;
  unlockedAccessories: string[];
  currentAccessories: string[];

  // Room
  roomItems: RoomItem[];
  roomTheme: string;
  unlockedThemes: string[];

  // Achievements
  achievements: Achievement[];

  // Inventory
  inventory: InventoryItem[];

  // Boss
  weeklyBoss: WeeklyBoss | null;
  bossesDefeated: number;

  // Stats
  totalQuestsCompleted: number;
  totalDaysActive: number;
  activeDates: string[]; // Array of ISO date strings (YYYY-MM-DD)
  criticalHits: number;
  spinsUsed: number;

  // Settings
  soundEnabled: boolean;
  coach: CoachType;

  // Daily
  dailySpinAvailable: boolean;
  lastSpinDate: string | null;
};

// ============== CONSTANTS ==============

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
  4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300,
  19200, 21200, 23300, 25500, 27800, 30200, 32700, 35300, 38000, 40800,
  43700, 46700, 49800, 53000, 56300, 59700, 63200, 66800, 70500, 74300,
  78200, 82200, 86300, 90500, 94800, 99200, 103700, 108300, 113000, 117800,
];

export const LEVEL_UNLOCKS: Record<number, string[]> = {
  1: ["Basic avatar"],
  3: ["Dark mode theme"],
  5: ["Pet egg"],
  7: ["Room decoration"],
  10: ["New hairstyle: Wavy"],
  15: ["Outfit: Sporty"],
  20: ["Pet evolution: Creature"],
  25: ["Room theme: Cozy"],
  30: ["Accessory: Headband"],
  40: ["Legendary pet form"],
  50: ["Golden avatar glow"],
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: "first-quest", name: "First Steps", description: "Complete your first quest", icon: "👶", reward: 10 },
  { id: "streak-7", name: "Week Warrior", description: "7 day streak", icon: "🔥", reward: 50 },
  { id: "streak-30", name: "Monthly Master", description: "30 day streak", icon: "💪", reward: 150 },
  { id: "streak-100", name: "Centurion", description: "100 day streak", icon: "🏆", reward: 500 },
  { id: "combo-5", name: "Combo Starter", description: "Hit a 5x combo", icon: "⚡", reward: 25 },
  { id: "combo-10", name: "Combo King", description: "Hit a 10x combo", icon: "👑", reward: 100 },
  { id: "boss-1", name: "Boss Slayer", description: "Defeat your first weekly boss", icon: "🗡️", reward: 75 },
  { id: "boss-10", name: "Boss Hunter", description: "Defeat 10 weekly bosses", icon: "🐉", reward: 300 },
  { id: "crit-10", name: "Lucky Star", description: "Land 10 critical hits", icon: "⭐", reward: 50 },
  { id: "coins-1000", name: "Coin Collector", description: "Earn 1000 total coins", icon: "💰", reward: 100 },
  { id: "level-10", name: "Rising Star", description: "Reach level 10", icon: "🌟", reward: 100 },
  { id: "level-25", name: "Veteran", description: "Reach level 25", icon: "🎖️", reward: 250 },
  { id: "level-50", name: "Legend", description: "Reach level 50", icon: "👸", reward: 500 },
  { id: "pet-legendary", name: "Pet Whisperer", description: "Evolve pet to legendary", icon: "🦋", reward: 200 },
  { id: "perfect-day", name: "Perfect Day", description: "Complete all quests in one day", icon: "✨", reward: 50 },
  { id: "early-bird", name: "Early Bird", description: "Complete morning routine before 7am", icon: "🌅", reward: 75, secret: true },
  { id: "night-owl", name: "Night Owl Slayer", description: "Win Zero-Scroll boss 7 times", icon: "🦉", reward: 150, secret: true },
  { id: "spin-lucky", name: "Jackpot!", description: "Win legendary item from spin", icon: "🎰", reward: 200, secret: true },
];

export const BOSS_TEMPLATES = [
  { id: "procrastinator", name: "The Procrastinator", maxHp: 100 },
  { id: "dehydration-dragon", name: "Dehydration Dragon", maxHp: 120 },
  { id: "midnight-scroller", name: "Midnight Doomscroller", maxHp: 150 },
  { id: "couch-potato", name: "The Couch Potato", maxHp: 100 },
  { id: "sugar-demon", name: "Sugar Demon", maxHp: 130 },
];

export const PET_STAGES: Record<PetStage, { name: string; emoji: string; requiredFeedings: number }> = {
  egg: { name: "Mysterious Egg", emoji: "🥒", requiredFeedings: 0 },
  blob: { name: "Blobby", emoji: "🫧", requiredFeedings: 7 },
  creature: { name: "Glowbie", emoji: "✨", requiredFeedings: 30 },
  beast: { name: "Lumina", emoji: "🦊", requiredFeedings: 100 },
  legendary: { name: "Aurora", emoji: "🦄", requiredFeedings: 365 },
};

export const SHOP_ITEMS = [
  { id: "streak-shield", name: "Streak Shield", price: 100, type: "power-up" as const, description: "Protects your streak for one missed day" },
  { id: "xp-boost", name: "2x XP Boost", price: 150, type: "power-up" as const, description: "Double XP for 1 hour" },
  { id: "lucky-charm", name: "Lucky Charm", price: 200, type: "power-up" as const, description: "50% crit chance for the day" },
  { id: "pet-treat", name: "Pet Treat", price: 50, type: "pet-item" as const, description: "Instant +20 pet happiness" },
  { id: "pet-toy", name: "Pet Toy", price: 75, type: "pet-item" as const, description: "Play with your pet, +15 energy" },
  { id: "theme-dark", name: "Dark Mode", price: 500, type: "cosmetic" as const, description: "Sleek dark theme" },
  { id: "theme-sunset", name: "Sunset Vibes", price: 750, type: "cosmetic" as const, description: "Warm orange gradient theme" },
  { id: "hair-wavy", name: "Wavy Hair", price: 300, type: "cosmetic" as const, description: "Flowy wavy hairstyle" },
  { id: "outfit-sporty", name: "Sporty Outfit", price: 400, type: "cosmetic" as const, description: "Athletic wear" },
  { id: "accessory-headband", name: "Headband", price: 200, type: "cosmetic" as const, description: "Cute workout headband" },
  { id: "room-plant", name: "Potted Plant", price: 150, type: "room-item" as const, description: "A happy little plant" },
  { id: "room-poster", name: "Motivational Poster", price: 100, type: "room-item" as const, description: "You got this!" },
  { id: "room-lamp", name: "Cozy Lamp", price: 250, type: "room-item" as const, description: "Warm ambient lighting" },
];

export const SPIN_PRIZES = [
  { id: "coins-10", name: "10 Coins", weight: 30, type: "coins" as const, amount: 10 },
  { id: "coins-25", name: "25 Coins", weight: 20, type: "coins" as const, amount: 25 },
  { id: "coins-50", name: "50 Coins", weight: 10, type: "coins" as const, amount: 50 },
  { id: "xp-25", name: "25 XP", weight: 15, type: "xp" as const, amount: 25 },
  { id: "xp-50", name: "50 XP", weight: 8, type: "xp" as const, amount: 50 },
  { id: "streak-shield", name: "Streak Shield", weight: 5, type: "item" as const, itemId: "streak-shield" },
  { id: "pet-treat", name: "Pet Treat", weight: 7, type: "item" as const, itemId: "pet-treat" },
  { id: "lucky-charm", name: "Lucky Charm", weight: 3, type: "item" as const, itemId: "lucky-charm" },
  { id: "mystery-cosmetic", name: "Mystery Cosmetic", weight: 2, type: "cosmetic" as const },
];

// ============== DEFAULT STATE ==============

const DEFAULT_STATE: GameState = {
  totalXp: 0,
  level: 1,
  coins: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  streakShields: 0,
  currentCombo: 0,
  bestCombo: 0,
  pet: null,
  unlockedPets: [],
  avatarMood: "okay",
  unlockedOutfits: ["default"],
  currentOutfit: "default",
  unlockedHair: ["default"],
  currentHair: "default",
  unlockedAccessories: [],
  currentAccessories: [],
  roomItems: [],
  roomTheme: "default",
  unlockedThemes: ["default"],
  achievements: [],
  inventory: [],
  weeklyBoss: null,
  bossesDefeated: 0,
  totalQuestsCompleted: 0,
  totalDaysActive: 0,
  activeDates: [],
  criticalHits: 0,
  spinsUsed: 0,
  soundEnabled: true,
  coach: "hype",
  dailySpinAvailable: false,
  lastSpinDate: null,
};

const STORAGE_KEY = "glowUpGameState";

// ============== HELPERS ==============

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getXpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().slice(0, 10);
}

function getPetStage(feedings: number): PetStage {
  if (feedings >= 365) return "legendary";
  if (feedings >= 100) return "beast";
  if (feedings >= 30) return "creature";
  if (feedings >= 7) return "blob";
  return "egg";
}

// ============== CONTEXT ==============

type GameContextType = {
  state: GameState;

  // XP & Leveling
  addXp: (amount: number, isCritical?: boolean) => { leveledUp: boolean; newLevel: number; isCritical: boolean };

  // Coins
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;

  // Combos
  incrementCombo: () => number;
  resetCombo: () => void;

  // Streaks
  recordActivity: () => void;
  useStreakShield: () => boolean;

  // Quests
  completeQuest: (xpReward: number, coinReward: number) => { leveledUp: boolean; isCritical: boolean; comboMultiplier: number };

  // Pet
  feedPet: () => void;
  namePet: (name: string) => void;
  unlockPet: () => void;

  // Boss
  damageBoss: (amount: number) => { defeated: boolean };
  spawnWeeklyBoss: () => void;

  // Achievements
  unlockAchievement: (id: string) => boolean;
  checkAchievements: () => string[];

  // Inventory & Shop
  addItem: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => boolean;
  purchaseItem: (itemId: string) => boolean;

  // Daily Spin
  canSpin: () => boolean;
  enableSpin: () => void;
  useSpin: () => typeof SPIN_PRIZES[number] | null;

  // Settings
  toggleSound: () => void;
  setCoach: (coach: CoachType) => void;

  // Cosmetics
  equipOutfit: (id: string) => void;
  equipHair: (id: string) => void;
  toggleAccessory: (id: string) => void;
  setRoomTheme: (id: string) => void;

  // Helpers
  getXpProgress: () => { current: number; needed: number; percent: number };
  getAvatarMood: () => AvatarMood;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GameState;
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch {
        // Parse error - keep defaults
      }
    }
    // Mark loading complete - batched with state update
    setIsLoading(false);
  }, []);

  // Save state to localStorage - only after loading is complete
  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isLoading]);

  // Check and spawn weekly boss
  useEffect(() => {
    if (isLoading) return;
    const weekStart = getWeekStart();
    if (!state.weeklyBoss || state.weeklyBoss.weekStart !== weekStart) {
      const template = BOSS_TEMPLATES[Math.floor(Math.random() * BOSS_TEMPLATES.length)];
      setState(prev => ({
        ...prev,
        weeklyBoss: {
          ...template,
          currentHp: template.maxHp,
          defeated: false,
          weekStart,
        },
      }));
    }
  }, [isLoading, state.weeklyBoss]);

  // ============== ACTIONS ==============

  const addXp = useCallback((amount: number, forceCritical?: boolean) => {
    const isCritical = forceCritical ?? Math.random() < 0.1;
    const finalAmount = isCritical ? amount * 2 : amount;

    let leveledUp = false;
    let newLevel = state.level;

    setState(prev => {
      const newXp = prev.totalXp + finalAmount;
      newLevel = calculateLevel(newXp);
      leveledUp = newLevel > prev.level;

      return {
        ...prev,
        totalXp: newXp,
        level: newLevel,
        criticalHits: isCritical ? prev.criticalHits + 1 : prev.criticalHits,
      };
    });

    return { leveledUp, newLevel, isCritical };
  }, [state.level]);

  const addCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  const spendCoins = useCallback((amount: number) => {
    if (state.coins < amount) return false;
    setState(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [state.coins]);

  const incrementCombo = useCallback(() => {
    let newCombo = 0;
    setState(prev => {
      newCombo = prev.currentCombo + 1;
      return {
        ...prev,
        currentCombo: newCombo,
        bestCombo: Math.max(prev.bestCombo, newCombo),
      };
    });
    return newCombo;
  }, []);

  const resetCombo = useCallback(() => {
    setState(prev => ({ ...prev, currentCombo: 0 }));
  }, []);

  const recordActivity = useCallback(() => {
    const today = getTodayKey();

    setState(prev => {
      if (prev.lastActiveDate === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);

      // Add today to activeDates if not already there
      const newActiveDates = prev.activeDates.includes(today)
        ? prev.activeDates
        : [...prev.activeDates, today];

      let newStreak = 1;
      if (prev.lastActiveDate === yesterdayKey) {
        newStreak = prev.currentStreak + 1;
      } else if (prev.lastActiveDate && prev.lastActiveDate !== today && prev.streakShields > 0) {
        // Use streak shield automatically
        newStreak = prev.currentStreak;
        return {
          ...prev,
          lastActiveDate: today,
          streakShields: prev.streakShields - 1,
          totalDaysActive: prev.totalDaysActive + 1,
          activeDates: newActiveDates,
        };
      }

      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        lastActiveDate: today,
        totalDaysActive: prev.totalDaysActive + 1,
        activeDates: newActiveDates,
      };
    });
  }, []);

  const useStreakShield = useCallback(() => {
    if (state.streakShields < 1) return false;
    setState(prev => ({ ...prev, streakShields: prev.streakShields - 1 }));
    return true;
  }, [state.streakShields]);

  const completeQuest = useCallback((xpReward: number, coinReward: number) => {
    recordActivity();

    const comboMultiplier = Math.min(1 + (state.currentCombo * 0.1), 3); // Max 3x
    const combo = incrementCombo();
    const adjustedXp = Math.floor(xpReward * comboMultiplier);
    const adjustedCoins = Math.floor(coinReward * comboMultiplier);

    const { leveledUp, isCritical } = addXp(adjustedXp);
    addCoins(adjustedCoins);

    setState(prev => ({
      ...prev,
      totalQuestsCompleted: prev.totalQuestsCompleted + 1,
    }));

    // Damage boss
    if (state.weeklyBoss && !state.weeklyBoss.defeated) {
      damageBoss(5);
    }

    return { leveledUp, isCritical, comboMultiplier: combo };
  }, [state.currentCombo, state.weeklyBoss, recordActivity, incrementCombo, addXp, addCoins]);

  const feedPet = useCallback(() => {
    setState(prev => {
      if (!prev.pet || prev.pet.fedToday) return prev;

      const newFeedings = prev.pet.totalFeedings + 1;
      const newStage = getPetStage(newFeedings);
      const stageInfo = PET_STAGES[newStage];

      return {
        ...prev,
        pet: {
          ...prev.pet,
          fedToday: true,
          totalFeedings: newFeedings,
          happiness: Math.min(100, prev.pet.happiness + 10),
          energy: Math.min(100, prev.pet.energy + 15),
          stage: newStage,
          emoji: stageInfo.emoji,
        },
      };
    });
  }, []);

  const namePet = useCallback((name: string) => {
    setState(prev => {
      if (!prev.pet) return prev;
      return { ...prev, pet: { ...prev.pet, name } };
    });
  }, []);

  const unlockPet = useCallback(() => {
    setState(prev => {
      if (prev.pet) return prev;
      return {
        ...prev,
        pet: {
          name: "Your Pet",
          emoji: "🥚",
          stage: "egg",
          happiness: 50,
          energy: 80,
          fedToday: false,
          totalFeedings: 0,
        },
      };
    });
  }, []);

  const damageBoss = useCallback((amount: number) => {
    let defeated = false;

    setState(prev => {
      if (!prev.weeklyBoss || prev.weeklyBoss.defeated) return prev;

      const newHp = Math.max(0, prev.weeklyBoss.currentHp - amount);
      defeated = newHp === 0;

      return {
        ...prev,
        weeklyBoss: {
          ...prev.weeklyBoss,
          currentHp: newHp,
          defeated,
        },
        bossesDefeated: defeated ? prev.bossesDefeated + 1 : prev.bossesDefeated,
        coins: defeated ? prev.coins + 100 : prev.coins, // Boss defeat bonus
      };
    });

    return { defeated };
  }, []);

  const spawnWeeklyBoss = useCallback(() => {
    const weekStart = getWeekStart();
    const template = BOSS_TEMPLATES[Math.floor(Math.random() * BOSS_TEMPLATES.length)];

    setState(prev => ({
      ...prev,
      weeklyBoss: {
        ...template,
        currentHp: template.maxHp,
        defeated: false,
        weekStart,
      },
    }));
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    const achievement = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (!achievement) return false;

    const alreadyUnlocked = state.achievements.some(a => a.id === id);
    if (alreadyUnlocked) return false;

    setState(prev => ({
      ...prev,
      achievements: [...prev.achievements, { ...achievement, unlockedAt: new Date().toISOString() }],
      coins: prev.coins + achievement.reward,
    }));

    return true;
  }, [state.achievements]);

  const checkAchievements = useCallback(() => {
    const newlyUnlocked: string[] = [];

    // Check various conditions
    if (state.totalQuestsCompleted >= 1) {
      if (unlockAchievement("first-quest")) newlyUnlocked.push("first-quest");
    }
    if (state.currentStreak >= 7) {
      if (unlockAchievement("streak-7")) newlyUnlocked.push("streak-7");
    }
    if (state.currentStreak >= 30) {
      if (unlockAchievement("streak-30")) newlyUnlocked.push("streak-30");
    }
    if (state.currentStreak >= 100) {
      if (unlockAchievement("streak-100")) newlyUnlocked.push("streak-100");
    }
    if (state.bestCombo >= 5) {
      if (unlockAchievement("combo-5")) newlyUnlocked.push("combo-5");
    }
    if (state.bestCombo >= 10) {
      if (unlockAchievement("combo-10")) newlyUnlocked.push("combo-10");
    }
    if (state.bossesDefeated >= 1) {
      if (unlockAchievement("boss-1")) newlyUnlocked.push("boss-1");
    }
    if (state.bossesDefeated >= 10) {
      if (unlockAchievement("boss-10")) newlyUnlocked.push("boss-10");
    }
    if (state.criticalHits >= 10) {
      if (unlockAchievement("crit-10")) newlyUnlocked.push("crit-10");
    }
    if (state.level >= 10) {
      if (unlockAchievement("level-10")) newlyUnlocked.push("level-10");
    }
    if (state.level >= 25) {
      if (unlockAchievement("level-25")) newlyUnlocked.push("level-25");
    }
    if (state.level >= 50) {
      if (unlockAchievement("level-50")) newlyUnlocked.push("level-50");
    }
    if (state.pet?.stage === "legendary") {
      if (unlockAchievement("pet-legendary")) newlyUnlocked.push("pet-legendary");
    }

    return newlyUnlocked;
  }, [state, unlockAchievement]);

  const addItem = useCallback((itemId: string, quantity = 1) => {
    setState(prev => {
      const existing = prev.inventory.find(i => i.id === itemId);
      if (existing) {
        return {
          ...prev,
          inventory: prev.inventory.map(i =>
            i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }

      const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
      if (!shopItem) return prev;

      return {
        ...prev,
        inventory: [...prev.inventory, { id: itemId, name: shopItem.name, type: shopItem.type, quantity }],
      };
    });
  }, []);

  const useItem = useCallback((itemId: string) => {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || item.quantity < 1) return false;

    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0),
    }));

    // Apply item effects
    if (itemId === "streak-shield") {
      setState(prev => ({ ...prev, streakShields: prev.streakShields + 1 }));
    } else if (itemId === "pet-treat" && state.pet) {
      setState(prev => ({
        ...prev,
        pet: prev.pet ? { ...prev.pet, happiness: Math.min(100, prev.pet.happiness + 20) } : null,
      }));
    } else if (itemId === "pet-toy" && state.pet) {
      setState(prev => ({
        ...prev,
        pet: prev.pet ? { ...prev.pet, energy: Math.min(100, prev.pet.energy + 15) } : null,
      }));
    }

    return true;
  }, [state.inventory, state.pet]);

  const purchaseItem = useCallback((itemId: string) => {
    const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
    if (!shopItem || state.coins < shopItem.price) return false;

    setState(prev => ({ ...prev, coins: prev.coins - shopItem.price }));
    addItem(itemId);

    // Handle cosmetic unlocks
    if (shopItem.type === "cosmetic") {
      if (itemId.startsWith("theme-")) {
        setState(prev => ({ ...prev, unlockedThemes: [...prev.unlockedThemes, itemId] }));
      } else if (itemId.startsWith("hair-")) {
        setState(prev => ({ ...prev, unlockedHair: [...prev.unlockedHair, itemId] }));
      } else if (itemId.startsWith("outfit-")) {
        setState(prev => ({ ...prev, unlockedOutfits: [...prev.unlockedOutfits, itemId] }));
      } else if (itemId.startsWith("accessory-")) {
        setState(prev => ({ ...prev, unlockedAccessories: [...prev.unlockedAccessories, itemId] }));
      }
    }

    return true;
  }, [state.coins, addItem]);

  const canSpin = useCallback(() => {
    const today = getTodayKey();
    return state.dailySpinAvailable && state.lastSpinDate !== today;
  }, [state.dailySpinAvailable, state.lastSpinDate]);

  const enableSpin = useCallback(() => {
    setState(prev => ({ ...prev, dailySpinAvailable: true }));
  }, []);

  const useSpin = useCallback(() => {
    if (!canSpin()) return null;

    // Weighted random selection
    const totalWeight = SPIN_PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let prize = SPIN_PRIZES[0];

    for (const p of SPIN_PRIZES) {
      random -= p.weight;
      if (random <= 0) {
        prize = p;
        break;
      }
    }

    // Apply prize
    if (prize.type === "coins") {
      addCoins(prize.amount!);
    } else if (prize.type === "xp") {
      addXp(prize.amount!);
    } else if (prize.type === "item" && prize.itemId) {
      addItem(prize.itemId);
    }

    setState(prev => ({
      ...prev,
      dailySpinAvailable: false,
      lastSpinDate: getTodayKey(),
      spinsUsed: prev.spinsUsed + 1,
    }));

    return prize;
  }, [canSpin, addCoins, addXp, addItem]);

  const toggleSound = useCallback(() => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const setCoach = useCallback((coach: CoachType) => {
    setState(prev => ({ ...prev, coach }));
  }, []);

  const equipOutfit = useCallback((id: string) => {
    if (!state.unlockedOutfits.includes(id)) return;
    setState(prev => ({ ...prev, currentOutfit: id }));
  }, [state.unlockedOutfits]);

  const equipHair = useCallback((id: string) => {
    if (!state.unlockedHair.includes(id)) return;
    setState(prev => ({ ...prev, currentHair: id }));
  }, [state.unlockedHair]);

  const toggleAccessory = useCallback((id: string) => {
    if (!state.unlockedAccessories.includes(id)) return;
    setState(prev => ({
      ...prev,
      currentAccessories: prev.currentAccessories.includes(id)
        ? prev.currentAccessories.filter(a => a !== id)
        : [...prev.currentAccessories, id],
    }));
  }, [state.unlockedAccessories]);

  const setRoomTheme = useCallback((id: string) => {
    if (!state.unlockedThemes.includes(id)) return;
    setState(prev => ({ ...prev, roomTheme: id }));
  }, [state.unlockedThemes]);

  const getXpProgress = useCallback(() => {
    const currentLevelXp = LEVEL_THRESHOLDS[state.level - 1] ?? 0;
    const nextLevelXp = getXpForNextLevel(state.level);
    const progress = state.totalXp - currentLevelXp;
    const needed = nextLevelXp - currentLevelXp;
    const percent = Math.min(100, Math.round((progress / needed) * 100));
    return { current: progress, needed, percent };
  }, [state.totalXp, state.level]);

  const getAvatarMood = useCallback((): AvatarMood => {
    const { percent } = getXpProgress();
    if (state.currentStreak >= 30 || percent >= 90) return "glowing";
    if (state.currentStreak >= 14 || percent >= 70) return "great";
    if (state.currentStreak >= 7 || percent >= 50) return "good";
    if (state.currentStreak >= 1 || percent >= 20) return "okay";
    return "tired";
  }, [state.currentStreak, getXpProgress]);

  const value: GameContextType = {
    state,
    addXp,
    addCoins,
    spendCoins,
    incrementCombo,
    resetCombo,
    recordActivity,
    useStreakShield,
    completeQuest,
    feedPet,
    namePet,
    unlockPet,
    damageBoss,
    spawnWeeklyBoss,
    unlockAchievement,
    checkAchievements,
    addItem,
    useItem,
    purchaseItem,
    canSpin,
    enableSpin,
    useSpin,
    toggleSound,
    setCoach,
    equipOutfit,
    equipHair,
    toggleAccessory,
    setRoomTheme,
    getXpProgress,
    getAvatarMood,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
