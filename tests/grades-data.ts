// Grades of student A ("Zofia Testowa") like the integration's sensors show them.

import type { EntityRegistryDisplayEntry, HassEntity, HomeAssistant } from "../src/types";
import { mockHass } from "./helpers";

export const ZOFIA = "device-zofia";
export const KACPER = "device-kacper";

export const MATH = "sensor.zofia_testowa_matematyka";
export const POLISH = "sensor.zofia_testowa_jezyk_polski";
export const ART = "sensor.zofia_testowa_plastyka";
export const HEALTH = "sensor.zofia_testowa_edukacja_zdrowotna_oceny_opisowe";
export const READING = "sensor.zofia_testowa_jezyk_polski_oceny_opisowe";
export const GPA = "sensor.zofia_testowa_srednia_ocen";
export const PHYSICS = "sensor.kacper_probny_fizyka";

function grade(
  id: string,
  value: string,
  category: string,
  date: string,
  weight = 1,
  counts = true,
  corrects: string | null = null,
  comment = "",
) {
  const numeric = Number.parseFloat(value);
  return {
    id,
    grade: value,
    value: Number.isFinite(numeric) ? numeric : null,
    category,
    date,
    weight,
    counts,
    teacher: "Adam Rachunek",
    comment,
    corrects,
  };
}

/** States of Zofia (three subjects, descriptive grades, GPA) and Kacper (one subject). */
export function gradesStates(): Record<string, Partial<HassEntity>> {
  return {
    [MATH]: {
      state: "3.35",
      attributes: {
        subject: "Matematyka",
        semester: 1,
        average_source: "librus",
        averages: { semester_1: 3.35, semester_2: null, year: 3.35 },
        grades: {
          // Librus lists the correction (1104) after the other grades.
          semester_1: [
            grade("1102", "3", "Odpowiedź ustna", "2026-09-17"),
            grade("1105", "np", "Nieprzygotowanie", "2026-10-05", 0, false),
            grade("1101", "5", "Kartkówka", "2026-09-10", 2),
            grade("1103", "1", "Sprawdzian", "2026-09-20", 3, true, null, "Działania"),
            grade("1104", "4", "Sprawdzian", "2026-09-30", 3, true, "1103"),
          ],
          semester_2: [],
        },
        final_grades: [
          {
            period: "semester_1",
            grade: "4",
            proposed: true,
            category: "Proponowana (śródroczna)",
            date: "2026-10-19",
            teacher: "Adam Rachunek",
            id: "1190",
          },
        ],
        friendly_name: "Zofia Testowa Matematyka",
      },
    },
    [POLISH]: {
      state: "4.75",
      attributes: {
        subject: "Język polski",
        semester: 1,
        average_source: "librus",
        grades: { semester_1: [grade("1201", "5-", "Dyktando", "2026-10-01", 2)], semester_2: [] },
        final_grades: [],
        friendly_name: "Zofia Testowa Język polski",
      },
    },
    [ART]: {
      state: "unknown",
      attributes: {
        subject: "Plastyka",
        semester: 1,
        grades: { semester_1: [], semester_2: [] },
        final_grades: [],
        friendly_name: "Zofia Testowa Plastyka",
      },
    },
    [HEALTH]: {
      state: "2",
      attributes: {
        subject: "Edukacja zdrowotna",
        grades: {
          // Newest last on purpose: the card sorts by date.
          semester_1: [
            descriptive("d2", "Edukacja zdrowotna", 1, "WY", "2026-10-16", "Wyróżniająca prezentacja.\nBrawo!"),
            descriptive("d1", "Edukacja zdrowotna", 1, "OP", "2026-09-24", "Zna zasady zdrowego odżywiania."),
          ],
          semester_2: [],
        },
      },
    },
    [READING]: {
      state: "1",
      attributes: {
        subject: "Język polski",
        grades: {
          semester_1: [],
          semester_2: [descriptive("d3", "Język polski", 2, "B", "2027-03-02", "Czyta płynnie.", "Obszar: Czytanie")],
        },
      },
    },
    [GPA]: { state: "4.095", attributes: { semester: 1, average_source: "librus" } },
    [PHYSICS]: { state: "5.0", attributes: { subject: "Fizyka", semester: 2, grades: {} } },
    "sensor.other": { state: "1" },
  };
}

function descriptive(
  id: string,
  subject: string,
  semester: number,
  value: string,
  date: string,
  content: string,
  extra?: string,
) {
  const lines = [
    `Ocena: ${value}`,
    `Przedmiot: ${subject}`,
    `Data: ${date} (pon.)`,
    "Nauczyciel: Magdalena Przykładowa",
    ...(extra ? [extra] : []),
    `Treść oceny: ${content}`,
  ];
  return {
    id,
    subject,
    semester,
    grade: value,
    date,
    teacher: "Magdalena Przykładowa",
    content,
    description: lines.join("\n"),
  };
}

function entry(entity_id: string, device_id: string, translation_key: string): EntityRegistryDisplayEntry {
  return { entity_id, device_id, translation_key, platform: "librus_apix" };
}

/** hass with the registry of both students. */
export function gradesHass(language = "pl", states = gradesStates()): HomeAssistant {
  const hass = mockHass(states, language);
  hass.entities = Object.fromEntries(
    [
      entry(MATH, ZOFIA, "subject_grades"),
      entry(POLISH, ZOFIA, "subject_grades"),
      entry(ART, ZOFIA, "subject_grades"),
      entry(HEALTH, ZOFIA, "subject_descriptive"),
      entry(READING, ZOFIA, "subject_descriptive"),
      entry(GPA, ZOFIA, "gpa"),
      entry(PHYSICS, KACPER, "subject_grades"),
    ].map((e) => [e.entity_id, e]),
  );
  return hass;
}
