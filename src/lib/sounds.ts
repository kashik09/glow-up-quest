"use client";

type SoundType =
  | "click"
  | "complete"
  | "combo"
  | "levelUp"
  | "critical"
  | "coin"
  | "bossHit"
  | "bossDefeat"
  | "achievement"
  | "spin"
  | "spinWin"
  | "error"
  | "petHappy";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }

  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

function playChord(frequencies: number[], duration: number, type: OscillatorType = "sine", volume = 0.05) {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, type, volume), i * 30);
  });
}

export function playSound(sound: SoundType, enabled = true) {
  if (!enabled) return;

  try {
    switch (sound) {
      case "click":
        playTone(800, 0.05, "sine", 0.05);
        break;

      case "complete":
        // Satisfying checkbox sound - rising arpeggio
        playChord([523, 659, 784], 0.15, "triangle", 0.08);
        break;

      case "combo":
        // Escalating tones based on combo count
        playChord([440, 554, 659], 0.12, "square", 0.06);
        break;

      case "levelUp":
        // Triumphant fanfare
        setTimeout(() => playTone(523, 0.15, "triangle", 0.1), 0);
        setTimeout(() => playTone(659, 0.15, "triangle", 0.1), 100);
        setTimeout(() => playTone(784, 0.15, "triangle", 0.1), 200);
        setTimeout(() => playTone(1047, 0.3, "triangle", 0.12), 300);
        break;

      case "critical":
        // Sparkly critical hit
        playTone(1200, 0.1, "sine", 0.08);
        setTimeout(() => playTone(1600, 0.1, "sine", 0.06), 50);
        setTimeout(() => playTone(2000, 0.15, "sine", 0.04), 100);
        break;

      case "coin":
        // Classic coin collect sound
        playTone(988, 0.08, "square", 0.06);
        setTimeout(() => playTone(1319, 0.12, "square", 0.06), 80);
        break;

      case "bossHit":
        // Impact thud
        playTone(100, 0.15, "sawtooth", 0.15);
        playTone(80, 0.2, "sine", 0.1);
        break;

      case "bossDefeat":
        // Victory jingle
        setTimeout(() => playTone(392, 0.1, "triangle", 0.1), 0);
        setTimeout(() => playTone(523, 0.1, "triangle", 0.1), 100);
        setTimeout(() => playTone(659, 0.1, "triangle", 0.1), 200);
        setTimeout(() => playTone(784, 0.2, "triangle", 0.12), 300);
        setTimeout(() => playTone(1047, 0.4, "triangle", 0.15), 450);
        break;

      case "achievement":
        // Achievement unlocked fanfare
        playChord([523, 659, 784, 1047], 0.3, "triangle", 0.06);
        break;

      case "spin":
        // Wheel spinning click
        playTone(600 + Math.random() * 200, 0.03, "square", 0.04);
        break;

      case "spinWin":
        // Prize reveal
        setTimeout(() => playTone(784, 0.15, "sine", 0.1), 0);
        setTimeout(() => playTone(988, 0.15, "sine", 0.1), 150);
        setTimeout(() => playTone(1175, 0.25, "sine", 0.12), 300);
        break;

      case "error":
        // Soft error buzz
        playTone(200, 0.15, "sawtooth", 0.06);
        break;

      case "petHappy":
        // Cute chirp
        playTone(800, 0.08, "sine", 0.06);
        setTimeout(() => playTone(1000, 0.08, "sine", 0.06), 100);
        setTimeout(() => playTone(1200, 0.1, "sine", 0.05), 200);
        break;
    }
  } catch {
    // Audio is optional, fail silently
  }
}

// Play combo sound with escalating pitch
export function playComboSound(comboCount: number, enabled = true) {
  if (!enabled) return;

  const baseFreq = 440;
  const freq = baseFreq + (comboCount * 50);
  playTone(Math.min(freq, 1200), 0.1, "triangle", 0.08);
}
