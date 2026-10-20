import { describe, expect, it } from "vitest";

import "../src/index";
import {
  GRADES_CARD,
  GRADES_EDITOR,
  GradesCard,
  type GradesCardConfig,
  currentGrades,
} from "../src/cards/grades-card";
import type { FormField } from "../src/common/editor";
import type { HomeAssistant } from "../src/types";
import { mockHass, mount } from "./helpers";
import { GPA, KACPER, MATH, ZOFIA, gradesHass, gradesStates } from "./grades-data";

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
    // Oldest first: the correction (1104) is not last any more.
    expect([...math.querySelectorAll(".chip")].map(text)).toEqual(["5", "3", "1", "4", "np"]);
    expect(text(math.querySelector(".average"))).toBe("3,35");
    expect(text(rows(el)[2].querySelector(".meta"))).toBe("Brak ocen");
    expect(text(rows(el)[2].querySelector(".average"))).toBe("–");
  });

  it("marks grades that do not count and explains each chip", async () => {
    const chips = [...rows(await card())[1].querySelectorAll<HTMLElement>(".chip")];

    expect(chips[4].classList.contains("not-counted")).toBe(true);
    expect(chips[4].title).toBe("Nieprzygotowanie · 5.10.2026 · nie liczy się do średniej");
    expect(chips[3].title).toBe("Sprawdzian · 30.09.2026 · waga 3");
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
      "level_bad",
      "color_bad",
      "level_ok",
      "color_ok",
      "level_excellent",
      "color_excellent",
    ]);
    expect(f.data).toMatchObject({ device: ZOFIA, show_average: true, show_gpa: true });
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

