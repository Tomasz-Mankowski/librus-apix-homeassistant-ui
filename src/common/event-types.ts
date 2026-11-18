// Schedule event types (F6): each school names its own; preset groups collect the
// usual Librus names. A filter list holds groups ("group:tests") and types; the card
// has two of them, a whitelist (`types`) and a blacklist (`exclude_types`).

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
  // Lesson changes: the integration names them after the Librus list text (D-105).
  { id: "changes", types: ["Zastępstwo", "Odwołane zajęcia"] },
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

/** Normalized type names a filter list selects (groups expanded; an unknown group adds none). */
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

/**
 * Events that pass both lists (D-141): the whitelist first (an empty or missing list
 * keeps all), then the blacklist removes from the result, so it wins on overlap.
 * The order of the events is kept.
 */
export function filterByType(
  events: ScheduleEvent[],
  include: string[] | undefined,
  exclude?: string[],
): ScheduleEvent[] {
  const wanted = include?.length ? selectedTypes(include) : undefined;
  const unwanted = exclude?.length ? selectedTypes(exclude) : undefined;
  if (!wanted && !unwanted) {
    return events;
  }
  return events.filter((event) => {
    const type = normalize(eventType(event));
    return (!wanted || wanted.has(type)) && !unwanted?.has(type);
  });
}
