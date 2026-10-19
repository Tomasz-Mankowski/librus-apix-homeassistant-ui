// Schedule event types (F6): each school names its own; preset groups collect the
// usual Librus names. A filter is a list of groups ("group:tests") and types.

import type { ScheduleEvent } from "./schedule";

export interface TypeGroup {
  id: string;
  types: string[];
}

/** Preset groups: names from Librus schools (mock fixtures and common categories). */
export const TYPE_GROUPS: TypeGroup[] = [
  { id: "tests", types: ["Sprawdzian", "Kartkówka", "Klasówka", "Praca klasowa", "Test"] },
  { id: "trips", types: ["Wycieczka", "Wyjście"] },
  { id: "meetings", types: ["Zebranie z rodzicami", "Wywiadówka", "Konsultacje"] },
  { id: "days_off", types: ["Dzień wolny"] },
  { id: "contests", types: ["Konkurs", "Olimpiada"] },
];

export const GROUP_PREFIX = "group:";

function normalize(type: string): string {
  return type.trim().toLocaleLowerCase("pl");
}

/** Type of an event: from the JSON line, else the summary before ":". */
export function eventType(event: ScheduleEvent): string {
  return (event.fields?.type || event.summary.split(":")[0]).trim();
}

/** The distinct types of the events, sorted (Polish collation). */
export function typesIn(events: ScheduleEvent[]): string[] {
  const seen = new Map<string, string>();
  for (const event of events) {
    const type = eventType(event);
    if (type && !seen.has(normalize(type))) {
      seen.set(normalize(type), type);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, "pl"));
}

/** Normalized type names a filter selects (groups expanded). */
function selectedTypes(filter: string[]): Set<string> {
  const types = new Set<string>();
  for (const item of filter) {
    if (item.startsWith(GROUP_PREFIX)) {
      const group = TYPE_GROUPS.find((g) => g.id === item.slice(GROUP_PREFIX.length));
      group?.types.forEach((type) => types.add(normalize(type)));
    } else {
      types.add(normalize(item));
    }
  }
  return types;
}

/** Events whose type the filter selects; an empty or missing filter keeps all. */
export function filterByType(events: ScheduleEvent[], filter: string[] | undefined): ScheduleEvent[] {
  if (!filter?.length) {
    return events;
  }
  const types = selectedTypes(filter);
  return events.filter((event) => types.has(normalize(eventType(event))));
}
