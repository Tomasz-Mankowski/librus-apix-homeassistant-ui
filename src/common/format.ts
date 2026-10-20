// Dates and times in the user's HA language and time zone setting.

import { language } from "./localize";
import type { HomeAssistant } from "../types";

function timeZone(hass?: HomeAssistant): string | undefined {
  return hass?.locale?.time_zone === "server" ? hass.config?.time_zone : undefined;
}

function parse(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** "19.10.2026, 17:07" (pl) / "10/19/26, 5:07 PM" (en); the text itself if not a date. */
export function formatDateTime(hass: HomeAssistant | undefined, value: string): string {
  const date = parse(value);
  if (!date) {
    return value;
  }
  return new Intl.DateTimeFormat(language(hass), {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: timeZone(hass),
  }).format(date);
}

/**
 * A Librus wall-clock time ("2026-10-09 12:00:00", school time) as "9.10.2026, 12:00",
 * without a time-zone shift; other texts are returned as they are.
 */
export function formatWallTime(hass: HomeAssistant | undefined, value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (!match) {
    return value;
  }
  const [, year, month, day, hour, minute] = match.map(Number);
  return new Intl.DateTimeFormat(language(hass), {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, hour, minute)));
}

/** Time of day: "09:50" (pl) / "9:50 AM" (en). */
export function formatTime(hass: HomeAssistant | undefined, date: Date): string {
  return new Intl.DateTimeFormat(language(hass), { timeStyle: "short", timeZone: timeZone(hass) }).format(date);
}

/** Day of the month and short weekday of a date-time or a "YYYY-MM-DD" date: { day: "21", weekday: "śr." }. */
export function dayParts(hass: HomeAssistant | undefined, value: Date | string): { day: string; weekday: string } {
  const dateOnly = typeof value === "string";
  const date = dateOnly ? new Date(`${value}T12:00:00Z`) : value;
  const zone = dateOnly ? "UTC" : timeZone(hass);
  const lang = language(hass);
  return {
    day: new Intl.DateTimeFormat(lang, { day: "numeric", timeZone: zone }).format(date),
    weekday: new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: zone }).format(date),
  };
}

/** Date only: "19.10.2026" (pl); "YYYY-MM-DD" texts are dates without a time zone. */
export function formatDate(hass: HomeAssistant | undefined, value: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = parse(dateOnly ? `${value}T12:00:00Z` : value);
  if (!date) {
    return value;
  }
  return new Intl.DateTimeFormat(language(hass), {
    dateStyle: "short",
    timeZone: dateOnly ? "UTC" : timeZone(hass),
  }).format(date);
}

/** An average with two decimals in the HA language ("3,35" in Polish); "" for none. */
export function formatAverage(hass: HomeAssistant | undefined, value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "";
  }
  return new Intl.NumberFormat(language(hass), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
