import type { CalendarApiEvent, EventFields } from "../src/common/schedule";

/** A description as the integration writes it: readable lines, then the JSON line (D-078). */
export function description(fields: EventFields, lines: string[] = []): string {
  return [...lines, JSON.stringify({ librus_apix: 1, ...fields })].join("\n");
}

export const TEST: CalendarApiEvent = {
  summary: "Sprawdzian: Matematyka",
  start: { dateTime: "2026-10-21T09:50:00+02:00" },
  end: { dateTime: "2026-10-21T10:35:00+02:00" },
  uid: "szczegoly/3003",
  description: description(
    {
      id: "szczegoly/3003",
      date: "2026-10-21",
      type: "Sprawdzian",
      subject: "Matematyka",
      teacher: "Adam Rachunek",
      lesson: 3,
      hour: null,
      description: "Ułamki zwykłe",
      date_added: "2026-10-09 12:00:00",
      details: {
        Data: "2026-10-21",
        "Nr lekcji": "3",
        Rodzaj: "Sprawdzian",
        Przedmiot: "Matematyka",
        Nauczyciel: "Adam Rachunek",
        Opis: "Ułamki zwykłe",
        "Data dodania": "2026-10-09 12:00:00",
        Sala: "12",
      },
    },
    ["Data: 2026-10-21", "Nr lekcji: 3", "Rodzaj: Sprawdzian"],
  ),
};

export const TRIP: CalendarApiEvent = {
  summary: "Wycieczka: Muzeum Techniki",
  start: { date: "2026-10-23" },
  end: { date: "2026-10-24" },
  uid: "szczegoly/3005",
  description: description({
    id: "szczegoly/3005",
    date: "2026-10-23",
    type: "Wycieczka",
    subject: "",
    teacher: "Magdalena Przykładowa",
    lesson: null,
    description: "Muzeum Techniki",
    date_added: "2026-10-04 12:00:00",
    details: {},
  }),
};

export const MEETING: CalendarApiEvent = {
  summary: "Zebranie z rodzicami",
  start: { dateTime: "2026-10-28T17:00:00+01:00" },
  end: { dateTime: "2026-10-28T18:00:00+01:00" },
  uid: "szczegoly/3007",
  description: description({
    id: "szczegoly/3007",
    date: "2026-10-28",
    type: "Zebranie z rodzicami",
    teacher: "Magdalena Przykładowa",
    lesson: null,
    hour: "17:00",
    description: "",
    details: {},
  }),
};

/** Already over at the test time (2026-10-19 10:00 Warsaw). */
export const PAST: CalendarApiEvent = {
  summary: "Kartkówka: Język polski",
  start: { dateTime: "2026-10-19T08:00:00+02:00" },
  end: { dateTime: "2026-10-19T08:45:00+02:00" },
  uid: "szczegoly/3001",
  description: description({ id: "szczegoly/3001", type: "Kartkówka", subject: "Język polski", lesson: 1 }),
};

/** 2026-10-19 10:00 in Warsaw. */
export const NOW = new Date("2026-10-19T08:00:00Z");
