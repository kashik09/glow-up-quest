"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CalendarDay = {
  date: Date;
  inCurrentMonth: boolean;
};

type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  className?: string;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromYmd(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toDisplay(date: Date) {
  return date.toLocaleDateString("en-GB");
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendar(month: Date): CalendarDay[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const mondayFirstOffset = (start.getDay() + 6) % 7;
  const daysInMonth = end.getDate();

  const days: CalendarDay[] = [];

  for (let i = mondayFirstOffset; i > 0; i--) {
    const date = new Date(start);
    date.setDate(start.getDate() - i);
    days.push({ date, inCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(month.getFullYear(), month.getMonth(), i),
      inCurrentMonth: true,
    });
  }

  while (days.length < 42) {
    const date = new Date(end);
    date.setDate(end.getDate() + (days.length - (mondayFirstOffset + daysInMonth) + 1));
    days.push({ date, inCurrentMonth: false });
  }

  return days;
}

export function DatePicker({ id, value, onChange, className }: DatePickerProps) {
  const selected = fromYmd(value);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selected ?? today);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) return;
    setMonth(selected);
  }, [value, selected]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const days = useMemo(() => buildCalendar(month), [month]);

  const pickDate = (date: Date) => {
    onChange(toYmd(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-xl border-2 border-purple/20 bg-white/70 px-4 py-2.5 text-left text-ink transition-all hover:border-purple/40 hover:bg-white"
      >
        {selected ? toDisplay(selected) : "dd/mm/yyyy"}
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-[280px] rounded-2xl border-2 border-purple/20 bg-white/95 p-4 shadow-soft backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold text-ink">{monthLabel(month)}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="h-8 w-8 rounded-lg bg-purple-light/60 text-purple-bright hover:bg-purple-light"
                aria-label="Previous month"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="h-8 w-8 rounded-lg bg-purple-light/60 text-purple-bright hover:bg-purple-light"
                aria-label="Next month"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map(({ date, inCurrentMonth }) => {
              const isToday = sameDay(date, today);
              const isSelected = selected ? sameDay(date, selected) : false;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => pickDate(date)}
                  className={cn(
                    "h-8 rounded-lg text-sm transition-all",
                    !inCurrentMonth && "text-muted/60",
                    inCurrentMonth && "text-ink",
                    isToday && "ring-1 ring-blue-bright/50",
                    isSelected
                      ? "bg-gradient-to-r from-purple to-blue text-white font-bold shadow-glow-blue"
                      : "hover:bg-purple-light/60"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => onChange("")}
              className="font-semibold text-muted hover:text-pink-bright"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pickDate(today)}
              className="font-semibold text-blue-bright hover:text-purple-bright"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
