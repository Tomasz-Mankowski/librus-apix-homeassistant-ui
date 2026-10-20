import { describe, expect, it } from "vitest";

import "../src/index";
import {
  GRADES_CARD,
  GRADES_EDITOR,
  GradesCard,
  type GradesCardConfig,
  currentGrades,
} from "../src/cards/grades-card";
import type { LibrusDialog } from "../src/common/dialog";
import type { FormField } from "../src/common/editor";
import type { HomeAssistant } from "../src/types";
import { mockHass, mount } from "./helpers";
import { GPA, KACPER, MATH, POLISH, ZOFIA, gradesHass, gradesStates } from "./grades-data";

async function card(config: Partial<GradesCardConfig> = {}, hass: HomeAssistant = gradesHass()): Promise<GradesCard> {
  return mount<GradesCard>(GRADES_CARD, (c) => {
    c.setConfig({ type: `custom:${GRADES_CARD}`, device: ZOFIA, ...config });
    c.hass = hass;
  });
}

function rows(el: GradesCard): HTMLLIElement[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLLIElement>("ul.items > li")];
}

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function subjectsOf(el: GradesCard): string[] {
  return rows(el).map((row) => text(row.querySelector(".title")));
}

describe("grades card", () => {
  it("is defined once and listed in the card picker", () => {
    expect(customElements.get(GRADES_CARD)).toBe(GradesCard);
    expect(window.customCards?.filter((c) => c.type === GRADES_CARD)).toHaveLength(1);
  });

  it("shows one row per subject with the grades of the current semester and the average", async () => {
    const el = await card();

    expect(text(el.shadowRoot!.querySelector(".card-header"))).toBe("Oceny");
    expect(subjectsOf(el)).toEqual(["Język polski", "Matematyka", "Plastyka"]);
    const math = rows(el)[1];
    // Newest first in the DOM; the reversed strip shows them oldest to newest, and the
    // correction (1104) is in date order, not last.
    expect([...math.querySelectorAll(".chip")].map(text)).toEqual(["np", "4", "1", "3", "5"]);
    expect(text(math.querySelector(".average"))).toBe("3,35");
    expect(text(rows(el)[2].querySelector(".meta"))).toBe("Brak ocen");
    expect(text(rows(el)[2].querySelector(".average"))).toBe("–");
  });

  it("marks grades that do not count and explains each chip", async () => {
    const chips = [...rows(await card())[1].querySelectorAll<HTMLElement>(".chip")];

    expect(chips[0].classList.contains("not-counted")).toBe(true);
    expect(chips[0].title).toBe("Nieprzygotowanie · 5.10.2026 · nie liczy się do średniej");
    expect(chips[1].title).toBe("Sprawdzian · 30.09.2026 · waga 3");
  });

  it("hides excluded subjects", async () => {
    expect(subjectsOf(await card({ exclude: ["Matematyka", "Plastyka"] }))).toEqual(["Język polski"]);
  });

  it("shows the subject averages and the GPA only when on", async () => {
    const on = await card();
    expect(text(on.shadowRoot!.querySelector(".gpa"))).toBe("Średnia ocen 4,10 semestr 1");

    const off = await card({ show_average: false, show_gpa: false });
    expect(off.shadowRoot!.querySelector(".gpa")).toBeNull();
    expect(off.shadowRoot!.querySelector(".average")).toBeNull();
  });

  it("colours subjects and the GPA by the levels (lower bounds)", async () => {
    const el = await card({ level_bad: 2, level_ok: 3.5, level_excellent: 4.5, color_excellent: "#00aa00" });

    const [polish, math, art] = rows(el);
    expect(polish.classList.contains("level")).toBe(true);
    expect(polish.style.getPropertyValue("--librus-level-color")).toBe("#00aa00");
    expect(math.style.getPropertyValue("--librus-level-color")).toBe("var(--red-color)");
    // No average: no colour.
    expect(art.classList.contains("level")).toBe(false);
    const gpa = el.shadowRoot!.querySelector<HTMLElement>(".gpa")!;
    expect(gpa.style.getPropertyValue("--librus-level-color")).toBe("var(--amber-color)");
  });

  it("colours nothing when the levels are empty", async () => {
    const el = await card({ level_bad: undefined, color_bad: "red" });

    expect(rows(el).some((row) => row.classList.contains("level"))).toBe(false);
    expect(el.shadowRoot!.querySelector<HTMLElement>(".gpa")!.style.getPropertyValue("--librus-level-color")).toBe("");
  });

  it("shows the semester-2 grades when the subject is in semester 2", () => {
    const state = {
      entity_id: MATH,
      state: "4",
      attributes: {
        semester: 2,
        grades: { semester_1: [{ id: "1", grade: "2", date: "2026-10-01" }], semester_2: [{ id: "2", grade: "6", date: "2027-03-01" }] },
      },
      last_changed: "",
      last_updated: "",
    };
    expect(currentGrades(state).map((g) => g.grade)).toEqual(["6"]);
    expect(currentGrades(undefined)).toEqual([]);
  });

  it("uses the configured title and the English texts", async () => {
    const el = await card({ title: "Zofia" }, gradesHass("en"));

    expect(text(el.shadowRoot!.querySelector(".card-header"))).toBe("Zofia");
    expect(text(el.shadowRoot!.querySelector(".gpa"))).toBe("GPA 4.10 semester 1");
  });

  it("warns when the device has no Librus entities, and says when there are no subjects", async () => {
    const missing = await card({ device: "device-unknown" });
    expect(text(missing.shadowRoot!.querySelector(".warning"))).toBe(
      "Nie znaleziono ucznia Librus dla tego urządzenia.",
    );

    const hass = gradesHass();
    hass.entities = { [GPA]: { entity_id: GPA, device_id: ZOFIA, platform: "librus_apix", translation_key: "gpa" } };
    const empty = await card({}, hass);
    expect(text(empty.shadowRoot!.querySelector(".empty"))).toBe("Brak przedmiotów z ocenami");
  });

  it("needs a device", () => {
    const el = document.createElement(GRADES_CARD) as GradesCard;
    expect(() => el.setConfig({ type: `custom:${GRADES_CARD}` })).toThrow("Device required");
  });

  it("renders again for a state of the student, not for other entities", async () => {
    const el = await card();
    const states = gradesStates();

    const other = gradesHass("pl", { ...states, "sensor.other": { state: "2" } });
    el.hass = other;
    await el.updateComplete;
    expect(text(rows(el)[1].querySelector(".average"))).toBe("3,35");

    const changed = gradesHass("pl", { ...states, [MATH]: { ...states[MATH], state: "3.5" } });
    el.hass = changed;
    await el.updateComplete;
    expect(text(rows(el)[1].querySelector(".average"))).toBe("3,50");
  });

  it("suggests the first student with grades in the card picker", () => {
    expect(GradesCard.getStubConfig(gradesHass())).toEqual({ type: `custom:${GRADES_CARD}`, device: ZOFIA });
    expect(GradesCard.getStubConfig(mockHass()).device).toBe("");
  });

  it("shows another student's subjects for another device", async () => {
    expect(subjectsOf(await card({ device: KACPER }))).toEqual(["Fizyka"]);
  });
});

async function openSubject(el: GradesCard, index: number): Promise<LibrusDialog> {
  rows(el)[index].querySelector("button")!.click();
  await el.updateComplete;
  const dialog = el.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
  await dialog.updateComplete;
  return dialog;
}

function tableRows(dialog: LibrusDialog, table = 0): string[][] {
  const element = dialog.querySelectorAll("table.grades")[table];
  return [...element.querySelectorAll("tbody tr")].map((tr) => [...tr.querySelectorAll("td")].map((td) => text(td)));
}

describe("grades card pop-up", () => {
  it("opens a subject with all grades of both semesters", async () => {
    const dialog = await openSubject(await card(), 1);

    expect(dialog.open).toBe(true);
    expect(dialog.heading).toBe("Matematyka");
    expect([...dialog.querySelectorAll("table.grades thead th")].map(text)).toEqual([
      "Ocena",
      "Kategoria",
      "Waga",
      "Data",
      "Nauczyciel",
      "Do średniej",
      "Komentarz",
    ]);
    expect(tableRows(dialog)).toEqual([
      ["5", "Kartkówka", "2", "10.09.2026", "Adam Rachunek", "Tak", ""],
      ["3", "Odpowiedź ustna", "1", "17.09.2026", "Adam Rachunek", "Tak", ""],
      ["1 poprawiona", "Sprawdzian", "3", "20.09.2026", "Adam Rachunek", "Tak", "Działania"],
      ["4 poprawa oceny 1", "Sprawdzian", "3", "30.09.2026", "Adam Rachunek", "Tak", ""],
      ["np", "Nieprzygotowanie", "0", "5.10.2026", "Adam Rachunek", "Nie", ""],
    ]);
    expect([...dialog.querySelectorAll("h3")].map(text)).toEqual([
      "Semestr 1",
      "Semestr 2",
      "Oceny śródroczne i roczne",
    ]);
    expect(text(dialog.querySelector("h3 + .empty"))).toBe("Brak ocen");
  });

  it("marks the correction and the corrected grade, also on the list", async () => {
    const el = await card();
    const listChips = [...rows(el)[1].querySelectorAll<HTMLElement>(".chip")];
    expect(listChips.map((chip) => chip.classList.contains("corrected"))).toEqual([false, false, true, false, false]);
    expect(listChips[2].title).toBe("Sprawdzian · 20.09.2026 · waga 3 · poprawiona");

    const dialog = await openSubject(el, 1);
    const [, , corrected, correction] = [...dialog.querySelectorAll("tbody tr")];
    expect(corrected.classList.contains("corrected")).toBe(true);
    expect(correction.classList.contains("correction")).toBe(true);
    expect(text(correction.querySelector(".note"))).toBe("poprawa oceny 1");
  });

  it("labels each cell for the phone layout and hides empty comments there", async () => {
    const dialog = await openSubject(await card(), 1);
    const cells = [...dialog.querySelectorAll("tbody tr")][2].querySelectorAll("td");

    expect([...cells].map((td) => td.dataset.label)).toEqual([
      "Ocena",
      "Kategoria",
      "Waga",
      "Data",
      "Nauczyciel",
      "Do średniej",
      "Komentarz",
    ]);
    expect(cells[6].classList.contains("blank")).toBe(false);
    expect([...dialog.querySelectorAll("tbody tr")][0].querySelectorAll("td")[6].classList.contains("blank")).toBe(true);
  });

  it("shows the averages and the semester and year grades", async () => {
    const dialog = await openSubject(await card(), 1);
    const [averages, finals] = [...dialog.querySelectorAll("dl")];

    const pairs = (dl: Element) => [...dl.querySelectorAll("dt")].map((dt) => [text(dt), text(dt.nextElementSibling)]);
    expect(pairs(averages)).toEqual([
      ["Semestr 1", "3,35"],
      ["Semestr 2", "–"],
      ["Rok szkolny", "3,35"],
      ["Średnia", "z Librusa"],
    ]);
    expect(pairs(finals)).toEqual([["Semestr 1", "4 Proponowana (śródroczna) · 19.10.2026 · Adam Rachunek"]]);
    expect(finals.querySelector(".chip.proposed")).not.toBeNull();
  });

  it("follows the sensor and closes", async () => {
    const el = await card();
    const dialog = await openSubject(el, 0);
    expect(tableRows(dialog)).toEqual([["5-", "Dyktando", "2", "1.10.2026", "Adam Rachunek", "Tak", ""]]);
    // No averages attribute: dashes; no semester grades, so only one list.
    const [averages, ...others] = [...dialog.querySelectorAll("dl")];
    expect([...averages.querySelectorAll("dd")].map(text)).toEqual(["–", "–", "–", "z Librusa"]);
    expect(others).toEqual([]);

    const states = gradesStates();
    const polish = states[POLISH]!;
    const grades = (polish.attributes as { grades: { semester_1: object[] } }).grades;
    el.hass = gradesHass("pl", {
      ...states,
      [POLISH]: {
        ...polish,
        attributes: {
          ...polish.attributes,
          grades: { ...grades, semester_1: [...grades.semester_1, { id: "1202", grade: "6", category: "Wypracowanie", date: "2026-10-10", weight: 3, counts: true, teacher: "Ewa Ortografia", comment: "", corrects: null }] },
        },
      },
    });
    await el.updateComplete;
    expect(tableRows(dialog).map((row) => row[0])).toEqual(["5-", "6"]);

    dialog.close();
    await dialog.updateComplete;
    await el.updateComplete;
    expect(dialog.querySelector("table")).toBeNull();
  });

  it("uses English texts and shows the calculated source", async () => {
    const states = gradesStates();
    const math = states[MATH]!;
    const hass = gradesHass("en", { ...states, [MATH]: { ...math, attributes: { ...math.attributes, average_source: "calculated" } } });
    const dialog = await openSubject(await card({}, hass), 1);

    expect([...dialog.querySelectorAll("table.grades thead th")].map(text)[5]).toBe("Counts");
    expect(text([...dialog.querySelectorAll("dl")][0].querySelectorAll("dd")[3])).toBe("calculated");
    expect(tableRows(dialog)[3][0]).toBe("4 correction of 1");
  });

  it("shows only the chosen pop-up elements", async () => {
    const some = await openSubject(await card({ popup_fields: ["date", "finals"] }), 1);
    expect([...some.querySelectorAll("table.grades thead th")].map(text)).toEqual(["Ocena", "Data"]);
    expect(tableRows(some)[0]).toEqual(["5", "10.09.2026"]);
    // No averages: the only list is the semester grades.
    expect([...some.querySelectorAll("dl")]).toHaveLength(1);
    expect([...some.querySelectorAll("h3")].map(text)).toContain("Oceny śródroczne i roczne");

    const bare = await openSubject(await card({ popup_fields: [] }), 1);
    expect([...bare.querySelectorAll("table.grades thead th")].map(text)).toEqual(["Ocena"]);
    expect(bare.querySelector("dl")).toBeNull();
    expect([...bare.querySelectorAll("h3")].map(text)).toEqual(["Semestr 1", "Semestr 2"]);
  });

  it("says when the subject sensor is gone", async () => {
    const el = await card();
    const dialog = await openSubject(el, 1);
    const states = gradesStates();
    delete states[MATH];
    el.hass = gradesHass("pl", states);
    await el.updateComplete;

    expect(text(dialog.querySelector(".empty"))).toBe("Brak ocen");
  });
});

type Editor = HTMLElement & { updateComplete: Promise<unknown>; hass: unknown; setConfig(c: object): void };

describe("grades card editor", () => {
  async function editor(config: Partial<GradesCardConfig> = {}): Promise<Editor> {
    return mount<Editor>(GRADES_EDITOR, (el) => {
      el.hass = gradesHass();
      el.setConfig({ type: `custom:${GRADES_CARD}`, device: ZOFIA, ...config });
    });
  }

  function form(el: Editor) {
    return el.shadowRoot!.querySelector("ha-form") as HTMLElement & {
      data: GradesCardConfig;
      schema: FormField[];
      computeLabel(field: FormField): string;
    };
  }

  it("offers every option with defaults and Polish labels", async () => {
    const f = form(await editor());

    const names = f.schema.flatMap((field) => (field.schema ? field.schema.map((s) => s.name) : [field.name]));
    expect(names).toEqual([
      "device",
      "title",
      "icon",
      "icon_color",
      "exclude",
      "show_average",
      "show_gpa",
      "popup_fields",
      "level_bad",
      "color_bad",
      "level_ok",
      "color_ok",
      "level_excellent",
      "color_excellent",
    ]);
    expect(f.data).toMatchObject({
      device: ZOFIA,
      show_average: true,
      show_gpa: true,
      popup_fields: ["averages", "category", "weight", "date", "teacher", "counts", "comment", "finals"],
    });
    expect(f.computeLabel({ name: "popup_fields" })).toBe("Pokazywane w oknie szczegółów");
    expect(f.computeLabel({ name: "level_excellent" })).toBe("Średnia bardzo dobra od");
    expect(f.computeLabel({ name: "exclude" })).toBe("Ukryte przedmioty");
    const level = f.schema.flatMap((field) => field.schema ?? []).find((s) => s.name === "level_ok");
    expect(level?.selector).toEqual({ number: { min: 0, max: 6, step: 0.01, mode: "box" } });
  });

  it("lists the student's subjects and keeps configured ones", async () => {
    const f = form(await editor({ exclude: ["Religia"] }));

    const exclude = f.schema.find((field) => field.name === "exclude")!.selector!.select as {
      options: { value: string }[];
    };
    expect(exclude.options.map((o) => o.value)).toEqual(["Język polski", "Matematyka", "Plastyka", "Religia"]);
  });

  it("sets every option", async () => {
    const el = await editor();
    const changes: GradesCardConfig[] = [];
    el.addEventListener("config-changed", (e) => changes.push((e as CustomEvent).detail.config));
    const config: GradesCardConfig = {
      type: `custom:${GRADES_CARD}`,
      device: KACPER,
      title: "Oceny Kacpra",
      icon: "mdi:star",
      icon_color: "purple",
      exclude: ["Fizyka"],
      show_average: false,
      show_gpa: false,
      popup_fields: ["averages", "comment"],
      level_bad: 2,
      color_bad: "deep-orange",
      level_ok: 3.5,
      color_ok: "yellow",
      level_excellent: 4.75,
      color_excellent: "green",
    };

    form(el).dispatchEvent(new CustomEvent("value-changed", { detail: { value: config } }));

    expect(changes).toEqual([config]);
  });
});

