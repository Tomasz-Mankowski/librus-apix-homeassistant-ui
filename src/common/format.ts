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
