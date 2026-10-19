// Schedule events from the calendar REST API and the JSON line of their
// description (integration D-078): readable lines, then one JSON line.

import type { HomeAssistant } from "../types";

/** Fields of the JSON line ("librus_apix": 1 marks it). */
export interface EventFields {
  id?: string;
  date?: string;
  type?: string;
  subject?: string;
  teacher?: string;
  lesson?: number | null;
  hour?: string | null;
  description?: string;
  date_added?: string;
  details?: Record<string, string>;
}

/** An event of GET /api/calendars/<entity>: dateTime for timed, date for all-day. */
export interface CalendarApiEvent {
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  description?: string | null;
  uid?: string | null;
}

export interface ScheduleEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  allDay: boolean;
  /** "YYYY-MM-DD" of an all-day event (shown as is, in no time zone). */
  date?: string;
  /** Readable lines of the description (without the JSON line). */
  text: string;
  /** Fields of the JSON line; undefined for events of other calendars. */
  fields?: EventFields;
}

/** The fields of our JSON line (the last line starting with "{"), else undefined. */
export function parseDescription(description: string | null | undefined): {
  text: string;
  fields?: EventFields;
} {
  const lines = (description ?? "").split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].startsWith("{")) {
      continue;
    }
    try {
      const payload = JSON.parse(lines[i]) as Record<string, unknown>;
      if (payload && typeof payload === "object" && "librus_apix" in payload) {
        const { librus_apix: _version, ...fields } = payload;
        return { text: lines.slice(0, i).join("\n").trim(), fields: fields as EventFields };
      }
    } catch {
      // Not our JSON line: the whole description is text.
    }
    break;
  }
  return { text: (description ?? "").trim() };
}

/** A calendar date ("2026-10-23") as local midnight of that day. */
function localDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toScheduleEvent(event: CalendarApiEvent): ScheduleEvent {
  const allDay = !event.start.dateTime;
  const start = allDay ? localDate(event.start.date ?? "") : new Date(event.start.dateTime!);
  const end = allDay
    ? localDate(event.end.date ?? event.start.date ?? "")
    : new Date(event.end.dateTime ?? event.start.dateTime!);
  const { text, fields } = parseDescription(event.description);
  return {
    uid: event.uid ?? fields?.id ?? `${event.summary}|${start.toISOString()}`,
    summary: event.summary,
    start,
    end,
    allDay,
    date: allDay ? event.start.date : undefined,
    text,
    fields,
  };
}

/** Events that end after `from` and start before `until`, sorted by start. */
export function eventsInRange(events: ScheduleEvent[], from: Date, until: Date): ScheduleEvent[] {
  return events
    .filter((event) => event.end > from && event.start < until)
    .sort((a, b) => a.start.getTime() - b.start.getTime() || a.summary.localeCompare(b.summary));
}

/** Read the events of a calendar entity from `from` until `until`. */
export async function fetchEvents(
  hass: HomeAssistant,
  entityId: string,
  from: Date,
  until: Date,
): Promise<ScheduleEvent[]> {
  const query = `start=${encodeURIComponent(from.toISOString())}&end=${encodeURIComponent(until.toISOString())}`;
  const events = await hass.callApi<CalendarApiEvent[]>("GET", `calendars/${entityId}?${query}`);
  return eventsInRange(events.map(toScheduleEvent), from, until);
}
