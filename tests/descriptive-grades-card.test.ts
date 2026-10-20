import { describe, expect, it } from "vitest";

import "../src/index";
import {
  DESCRIPTIVE_CARD,
  DESCRIPTIVE_EDITOR,
  DescriptiveGradesCard,
  type DescriptiveGradesCardConfig,
  descriptiveGrades,
  extraLines,
} from "../src/cards/descriptive-grades-card";
import type { LibrusDialog } from "../src/common/dialog";
import type { FormField } from "../src/common/editor";
import type { HomeAssistant } from "../src/types";
import { mockHass, mount } from "./helpers";
import { HEALTH, KACPER, ZOFIA, gradesHass, gradesStates } from "./grades-data";

async function card(
  config: Partial<DescriptiveGradesCardConfig> = {},
  hass: HomeAssistant = gradesHass(),
): Promise<DescriptiveGradesCard> {
  return mount<DescriptiveGradesCard>(DESCRIPTIVE_CARD, (c) => {
    c.setConfig({ type: `custom:${DESCRIPTIVE_CARD}`, device: ZOFIA, ...config });
    c.hass = hass;
  });
}

function rows(el: DescriptiveGradesCard): HTMLLIElement[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLLIElement>("ul.items > li")];
}

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

async function open(el: DescriptiveGradesCard, index: number): Promise<LibrusDialog> {
  rows(el)[index].querySelector("button")!.click();
  await el.updateComplete;
  const dialog = el.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
  await dialog.updateComplete;
  return dialog;
}

describe("descriptive grades card", () => {
  it("is defined once and listed in the card picker", () => {
    expect(customElements.get(DESCRIPTIVE_CARD)).toBe(DescriptiveGradesCard);
    expect(window.customCards?.filter((c) => c.type === DESCRIPTIVE_CARD)).toHaveLength(1);
  });

  it("lists the subjects with the grade codes, the latest grade and the count", async () => {
    const el = await card();

    expect(text(el.shadowRoot!.querySelector(".card-header"))).toBe("Oceny opisowe");
    expect(rows(el).map((row) => text(row.querySelector(".title")))).toEqual(["Edukacja zdrowotna", "Język polski"]);
    const health = rows(el)[0];
    // Newest first in the DOM (the reversed strip shows them oldest to newest).
    expect([...health.querySelectorAll(".chip")].map(text)).toEqual(["WY", "OP"]);
    expect(text(health.querySelector(".meta"))).toBe("ostatnia 16.10.2026 · Wyróżniająca prezentacja. Brawo!");
    expect(text(health.querySelector(".count"))).toBe("2");
  });

  it("hides excluded subjects", async () => {
    const el = await card({ exclude: ["Edukacja zdrowotna"] });

    expect(rows(el).map((row) => text(row.querySelector(".title")))).toEqual(["Język polski"]);
  });

  it("opens every grade of the subject, newest first, one compact block each", async () => {
    const dialog = await open(await card(), 0);

    expect(dialog.open).toBe(true);
    expect(dialog.heading).toBe("Edukacja zdrowotna");
    const grades = [...dialog.querySelectorAll("ul.grades > li")];
    expect(grades.map((li) => text(li.querySelector(".head")))).toEqual([
      "WY 16.10.2026 · Magdalena Przykładowa · semestr 1",
      "OP 24.09.2026 · Magdalena Przykładowa · semestr 1",
    ]);
    // The full text keeps its line breaks; no label/value lists any more.
    expect(grades[0].querySelector(".content")!.textContent).toBe("Wyróżniająca prezentacja.\nBrawo!");
    expect(dialog.querySelector("dl")).toBeNull();
  });

  it("shows further Librus lines of a grade in one line", async () => {
    const dialog = await open(await card(), 1);

    expect(text(dialog.querySelector(".head"))).toBe("B 2.03.2027 · Magdalena Przykładowa · semestr 2");
    expect(text(dialog.querySelector(".details"))).toBe("Obszar: Czytanie");
    expect(text(dialog.querySelector(".content"))).toBe("Czyta płynnie.");
  });

  it("shows only the chosen pop-up elements", async () => {
    const dateOnly = await open(await card({ popup_fields: ["date"] }), 1);
    expect(text(dateOnly.querySelector(".head"))).toBe("B 2.03.2027");
    expect(dateOnly.querySelector(".details")).toBeNull();
    expect(dateOnly.querySelector(".content")).toBeNull();

    const bare = await open(await card({ popup_fields: [] }), 1);
    expect(text(bare.querySelector(".head"))).toBe("B");
    expect(bare.querySelector(".head .meta")).toBeNull();
  });

  it("says when a subject has no grades left", async () => {
    const states = gradesStates();
    const el = await card({}, gradesHass("pl", { ...states, [HEALTH]: { state: "0", attributes: { subject: "Edukacja zdrowotna", grades: {} } } }));

    expect(text(rows(el)[0].querySelector(".meta"))).toBe("Brak ocen opisowych");
    const dialog = await open(el, 0);
    expect(text(dialog.querySelector(".empty"))).toBe("Brak ocen opisowych");
  });

  it("uses English texts", async () => {
    const el = await card({}, gradesHass("en"));

    expect(text(el.shadowRoot!.querySelector(".card-header"))).toBe("Descriptive grades");
    expect(text(rows(el)[0].querySelector(".meta"))).toContain("latest 10/16/26");
  });

  it("warns for a device without Librus entities and has no rows for a student without descriptive grades", async () => {
    const missing = await card({ device: "device-unknown" });
    expect(text(missing.shadowRoot!.querySelector(".warning"))).toBe(
      "Nie znaleziono ucznia Librus dla tego urządzenia.",
    );

    const kacper = await card({ device: KACPER });
    expect(text(kacper.shadowRoot!.querySelector(".empty"))).toBe("Brak przedmiotów z ocenami opisowymi");
  });

  it("needs a device and suggests a student with descriptive grades", () => {
    const el = document.createElement(DESCRIPTIVE_CARD) as DescriptiveGradesCard;
    expect(() => el.setConfig({ type: `custom:${DESCRIPTIVE_CARD}` })).toThrow("Device required");
    expect(DescriptiveGradesCard.getStubConfig(gradesHass())).toEqual({ type: `custom:${DESCRIPTIVE_CARD}`, device: ZOFIA });
    expect(DescriptiveGradesCard.getStubConfig(mockHass()).device).toBe("");
  });

  it("reads grades and extra lines safely", () => {
    expect(descriptiveGrades(undefined)).toEqual([]);
    expect(
      extraLines({
        id: "x",
        subject: "S",
        semester: 1,
        grade: "A",
        date: "2026-10-01",
        teacher: "T",
        content: "C",
        description: "Ocena: A\nbez dwukropka\nObszar: Pisanie\nUwagi: brak",
      }),
    ).toEqual([
      ["Obszar", "Pisanie"],
      ["Uwagi", "brak"],
    ]);
  });
});

type Editor = HTMLElement & { updateComplete: Promise<unknown>; hass: unknown; setConfig(c: object): void };

describe("descriptive grades card editor", () => {
  async function editor(config: Partial<DescriptiveGradesCardConfig> = {}): Promise<Editor> {
    return mount<Editor>(DESCRIPTIVE_EDITOR, (el) => {
      el.hass = gradesHass();
      el.setConfig({ type: `custom:${DESCRIPTIVE_CARD}`, device: ZOFIA, ...config });
    });
  }

  function form(el: Editor) {
    return el.shadowRoot!.querySelector("ha-form") as HTMLElement & { data: object; schema: FormField[] };
  }

  it("offers device, header fields and the student's descriptive subjects", async () => {
    const f = form(await editor());

    const names = f.schema.flatMap((field) => (field.schema ? field.schema.map((s) => s.name) : [field.name]));
    expect(names).toEqual(["device", "title", "icon", "icon_color", "exclude", "popup_fields"]);
    expect(f.data).toMatchObject({ popup_fields: ["date", "teacher", "semester", "details", "content"] });
    const popup = f.schema.find((field) => field.name === "popup_fields")!.selector!.select as {
      options: { label: string }[];
    };
    expect(popup.options.map((o) => o.label)).toEqual([
      "Data",
      "Nauczyciel",
      "Semestr",
      "Inne pola z Librusa (np. obszar)",
      "Treść oceny",
    ]);
    const exclude = f.schema.find((field) => field.name === "exclude")!.selector!.select as { options: { value: string }[] };
    expect(exclude.options.map((o) => o.value)).toEqual(["Edukacja zdrowotna", "Język polski"]);
  });

  it("sets every option", async () => {
    const el = await editor();
    const changes: DescriptiveGradesCardConfig[] = [];
    el.addEventListener("config-changed", (e) => changes.push((e as CustomEvent).detail.config));
    const config: DescriptiveGradesCardConfig = {
      type: `custom:${DESCRIPTIVE_CARD}`,
      device: KACPER,
      title: "Opisowe",
      icon: "mdi:star",
      icon_color: "teal",
      exclude: ["Język polski"],
      popup_fields: ["date", "content"],
    };

    form(el).dispatchEvent(new CustomEvent("value-changed", { detail: { value: config } }));

    expect(changes).toEqual([config]);
  });
});
