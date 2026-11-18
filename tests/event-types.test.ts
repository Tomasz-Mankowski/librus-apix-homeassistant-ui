import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/index";
import { SCHEDULE_CARD, SCHEDULE_EDITOR, type ScheduleCard, type ScheduleCardConfig } from "../src/cards/schedule-card";
import type { FormField } from "../src/common/editor";
import { TYPE_GROUPS, eventType, filterByType, typesIn } from "../src/common/event-types";
import { localize } from "../src/common/localize";
import { toScheduleEvent, type CalendarApiEvent } from "../src/common/schedule";
import type { HomeAssistant } from "../src/types";
import { mockHass, mount } from "./helpers";
import { MEETING, NOW, PAST, TEST, TRIP, description } from "./schedule-data";

const ENTITY = "calendar.zofia_testowa_terminarz";
const QUIZ: CalendarApiEvent = {
  ...TEST,
  summary: "kartkówka: Przyroda",
  uid: "szczegoly/3013",
  start: { dateTime: "2026-10-22T08:00:00+02:00" },
  end: { dateTime: "2026-10-22T08:45:00+02:00" },
  description: description({ id: "szczegoly/3013", type: " kartkówka ", subject: "Przyroda" }),
};
const PLAIN: CalendarApiEvent = { ...MEETING, summary: "Apel: Święto szkoły", description: "", uid: "x" };
const EVENTS = [TEST, TRIP, MEETING, QUIZ, PLAIN].map(toScheduleEvent);

function summaries(events: { summary: string }[]): string[] {
  return events.map((e) => e.summary);
}

describe("event types", () => {
  it("takes the type from the JSON line, else from the summary", () => {
    expect(eventType(toScheduleEvent(TEST))).toBe("Sprawdzian");
    expect(eventType(toScheduleEvent(PLAIN))).toBe("Apel");
  });

  it("lists the distinct types of the data, sorted, case-insensitive", () => {
    // The first spelling seen is kept ("kartkówka" before "Kartkówka").
    expect(typesIn([...EVENTS, toScheduleEvent(PAST)])).toEqual([
      "Apel",
      "kartkówka",
      "Sprawdzian",
      "Wycieczka",
      "Zebranie z rodzicami",
    ]);
  });

  it("keeps all events without a filter", () => {
    expect(filterByType(EVENTS, undefined)).toHaveLength(5);
    expect(filterByType(EVENTS, [])).toHaveLength(5);
  });

  it("selects by preset group, ignoring case and spaces", () => {
    expect(summaries(filterByType(EVENTS, ["group:tests"]))).toEqual([
      "Sprawdzian: Matematyka",
      "kartkówka: Przyroda",
    ]);
    expect(summaries(filterByType(EVENTS, ["group:trips", "group:meetings"]))).toEqual([
      "Wycieczka: Muzeum Techniki",
      "Zebranie z rodzicami",
    ]);
  });

  it("selects by type name, also types of no group", () => {
    expect(summaries(filterByType(EVENTS, ["Apel", "wycieczka"]))).toEqual([
      "Wycieczka: Muzeum Techniki",
      "Apel: Święto szkoły",
    ]);
    expect(filterByType(EVENTS, ["group:unknown"])).toEqual([]);
  });

  it("has the presets of the plan", () => {
    expect(TYPE_GROUPS.find((g) => g.id === "tests")!.types).toEqual(
      expect.arrayContaining(["Sprawdzian", "Kartkówka", "Klasówka", "Praca klasowa"]),
    );
    expect(TYPE_GROUPS.find((g) => g.id === "trips")!.types).toContain("Wycieczka");
    expect(TYPE_GROUPS.find((g) => g.id === "changes")!.types).toEqual(["Zastępstwo", "Odwołane zajęcia"]);
  });

  it("selects lesson changes by their group", () => {
    const changes = [
      { type: "Zastępstwo", subject: "Informatyka", id: "a1" },
      { type: "Odwołane zajęcia", subject: "Przyroda", id: "b2" },
    ].map((fields) =>
      toScheduleEvent({
        ...TEST,
        summary: `${fields.type}: ${fields.subject}`,
        uid: fields.id,
        description: description({ ...fields, teacher: "Piotr Lasowy", lesson: 5 }),
      }),
    );
    expect(summaries(filterByType([...EVENTS, ...changes], ["group:changes"]))).toEqual([
      "Zastępstwo: Informatyka",
      "Odwołane zajęcia: Przyroda",
    ]);
  });
});

describe("type blacklist", () => {
  // EVENTS: Sprawdzian, Wycieczka, Zebranie z rodzicami, kartkówka, Apel; plus a "Test" (also of group:tests).
  const PLAIN_TEST = toScheduleEvent({
    ...TEST,
    summary: "Test: Biologia",
    uid: "szczegoly/3014",
    description: description({ id: "szczegoly/3014", type: "Test", subject: "Biologia" }),
  });
  const ALL = [...EVENTS, PLAIN_TEST];

  it("keeps every event when the blacklist is missing or empty", () => {
    expect(filterByType(EVENTS, undefined, undefined)).toBe(EVENTS);
    expect(filterByType(EVENTS, [], [])).toBe(EVENTS);
    expect(filterByType(EVENTS, undefined, [])).toBe(EVENTS);
    // The whitelist alone behaves as before.
    expect(summaries(filterByType(EVENTS, ["group:tests"], []))).toEqual(summaries(filterByType(EVENTS, ["group:tests"])));
  });

  it("removes the events of a preset group, keeping the order of the others", () => {
    expect(summaries(filterByType(ALL, undefined, ["group:tests"]))).toEqual([
      "Wycieczka: Muzeum Techniki",
      "Zebranie z rodzicami",
      "Apel: Święto szkoły",
    ]);
  });

  it("removes types by name, ignoring case and spaces", () => {
    expect(summaries(filterByType(EVENTS, undefined, ["KARTKÓWKA", "  apel "]))).toEqual([
      "Sprawdzian: Matematyka",
      "Wycieczka: Muzeum Techniki",
      "Zebranie z rodzicami",
    ]);
  });

  it("applies the whitelist first, then removes the blacklist from the result", () => {
    // All tests except "Test".
    expect(summaries(filterByType(ALL, ["group:tests"], ["Test"]))).toEqual([
      "Sprawdzian: Matematyka",
      "kartkówka: Przyroda",
    ]);
    // Several groups in, one type out.
    expect(summaries(filterByType(ALL, ["group:tests", "group:trips"], ["Sprawdzian"]))).toEqual([
      "Wycieczka: Muzeum Techniki",
      "kartkówka: Przyroda",
      "Test: Biologia",
    ]);
  });

  it("hides a type that is in both lists", () => {
    expect(summaries(filterByType(EVENTS, ["Wycieczka", "Sprawdzian"], ["sprawdzian"]))).toEqual([
      "Wycieczka: Muzeum Techniki",
    ]);
    expect(filterByType(ALL, ["group:tests"], ["group:tests"])).toEqual([]);
  });

  it("an unknown group removes nothing from the blacklist but still selects nothing in the whitelist", () => {
    expect(filterByType(EVENTS, undefined, ["group:unknown"])).toHaveLength(5);
    expect(filterByType(EVENTS, ["group:unknown"], [])).toEqual([]);
    expect(summaries(filterByType(EVENTS, ["Apel"], ["group:unknown"]))).toEqual(["Apel: Święto szkoły"]);
  });
});

describe("schedule card type filter", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  function hassWith(events: CalendarApiEvent[], language = "pl"): HomeAssistant {
    const hass = mockHass({ [ENTITY]: { state: "off" } }, language);
    hass.callApi = vi.fn(async () => events) as unknown as HomeAssistant["callApi"];
    return hass;
  }

  async function settle(el: HTMLElement & { updateComplete: Promise<unknown> }): Promise<void> {
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await el.updateComplete;
    }
  }

  async function cardWith(config: Partial<ScheduleCardConfig>, language = "pl"): Promise<ScheduleCard> {
    const el = await mount<ScheduleCard>(SCHEDULE_CARD, (c) => {
      c.setConfig({ type: `custom:${SCHEDULE_CARD}`, entity: ENTITY, ...config });
      c.hass = hassWith([TEST, TRIP, MEETING, QUIZ, PLAIN], language);
    });
    await settle(el);
    return el;
  }

  const card = (types: string[]): Promise<ScheduleCard> => cardWith({ types });

  /** Titles of the rows, in order. */
  function titles(el: ScheduleCard): (string | null)[] {
    return [...el.shadowRoot!.querySelectorAll("ul.items > li")].map((r) => r.querySelector(".title")!.textContent);
  }

  it("lists only the selected types; the nearest of them is highlighted", async () => {
    const el = await card(["group:tests"]);
    const rows = [...el.shadowRoot!.querySelectorAll("ul.items > li")];

    expect(rows.map((r) => r.querySelector(".title")!.textContent)).toEqual([
      "Sprawdzian: Matematyka",
      "kartkówka: Przyroda",
    ]);
    expect(rows[0].className).toBe("next");
  });

  it("says so when the filter leaves nothing", async () => {
    const el = await card(["Olimpiada"]);
    expect(el.shadowRoot!.querySelector(".empty")!.textContent).toBe(
      "Brak wydarzeń spełniających filtr rodzajów w ciągu najbliższych 14 dni",
    );
  });

  it("lists every event for a config without exclude_types, as in 1.1.1", async () => {
    const el = await cardWith({});

    // By start; the meeting and the assembly start together, then by title.
    expect(titles(el)).toEqual([
      "Sprawdzian: Matematyka",
      "kartkówka: Przyroda",
      "Wycieczka: Muzeum Techniki",
      "Apel: Święto szkoły",
      "Zebranie z rodzicami",
    ]);
    expect((await cardWith({ exclude_types: [] })).shadowRoot!.querySelectorAll("ul.items > li")).toHaveLength(5);
  });

  it("hides the events of a blacklisted group; the nearest remaining event is highlighted", async () => {
    const el = await cardWith({ exclude_types: ["group:tests"] });
    const rows = [...el.shadowRoot!.querySelectorAll("ul.items > li")];

    expect(titles(el)).toEqual(["Wycieczka: Muzeum Techniki", "Apel: Święto szkoły", "Zebranie z rodzicami"]);
    expect(rows.map((r) => r.className)).toEqual(["next", "", ""]);
    expect(el.shadowRoot!.querySelectorAll(".next-label")).toHaveLength(1);
    expect(rows[0].querySelector(".next-label")!.textContent).toBe("Najbliższe");
  });

  it("applies the whitelist first and the blacklist to its result", async () => {
    const el = await cardWith({ types: ["group:tests", "group:trips"], exclude_types: ["Sprawdzian"] });
    const rows = [...el.shadowRoot!.querySelectorAll("ul.items > li")];

    expect(titles(el)).toEqual(["kartkówka: Przyroda", "Wycieczka: Muzeum Techniki"]);
    expect(rows[0].className).toBe("next");
  });

  it("says so when the blacklist removes every event, in both languages", async () => {
    const config = { exclude_types: ["group:tests", "Wycieczka", "Zebranie z rodzicami", "apel"] };

    expect((await cardWith(config)).shadowRoot!.querySelector(".empty")!.textContent).toBe(
      "Brak wydarzeń spełniających filtr rodzajów w ciągu najbliższych 14 dni",
    );
    expect((await cardWith(config, "en")).shadowRoot!.querySelector(".empty")!.textContent).toBe(
      "No events match the type filter in the next 14 days",
    );
  });

  it("editor lists the preset groups, the types in the data and the configured ones", async () => {
    const editor = await mount<HTMLElement & { updateComplete: Promise<unknown>; hass: HomeAssistant; setConfig(c: object): void }>(
      SCHEDULE_EDITOR,
      (el) => {
        el.hass = hassWith([TEST, TRIP, MEETING, QUIZ, PLAIN]);
        el.setConfig({ type: `custom:${SCHEDULE_CARD}`, entity: ENTITY, types: ["group:tests", "Projekt"] });
      },
    );
    await settle(editor);

    const path = (editor.hass.callApi as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(path).toContain("end=2027-05-07T08%3A00%3A00.000Z");
    const form = editor.shadowRoot!.querySelector("ha-form") as HTMLElement & {
      data: ScheduleCardConfig;
      schema: FormField[];
    };
    const select = form.schema.find((f) => f.name === "types")!.selector!.select as {
      multiple: boolean;
      custom_value: boolean;
      options: { value: string; label: string }[];
    };
    expect(select.multiple && select.custom_value).toBe(true);
    expect(select.options.map((o) => o.value)).toEqual([
      "group:tests",
      "group:trips",
      "group:meetings",
      "group:days_off",
      "group:contests",
      "group:changes",
      "Apel",
      "kartkówka",
      "Sprawdzian",
      "Wycieczka",
      "Zebranie z rodzicami",
      "Projekt",
    ]);
    expect(select.options[0].label).toBe("Sprawdziany (Sprawdzian, Kartkówka, Klasówka, Praca klasowa, Test)");
    expect(form.data.types).toEqual(["group:tests", "Projekt"]);
  });

  it("editor still offers the groups when the calendar cannot be read", async () => {
    const editor = await mount<HTMLElement & { updateComplete: Promise<unknown>; hass: HomeAssistant; setConfig(c: object): void }>(
      SCHEDULE_EDITOR,
      (el) => {
        el.hass = mockHass({}, "en");
        el.hass.callApi = vi.fn(async () => {
          throw new Error("no calendar");
        }) as unknown as HomeAssistant["callApi"];
        el.setConfig({ type: `custom:${SCHEDULE_CARD}`, entity: ENTITY });
      },
    );
    await settle(editor);

    const form = editor.shadowRoot!.querySelector("ha-form") as HTMLElement & { schema: FormField[] };
    const select = form.schema.find((f) => f.name === "types")!.selector!.select as { options: { label: string }[] };
    expect(select.options.map((o) => o.label.split(" (")[0])).toEqual([
      "Tests",
      "Trips",
      "Meetings",
      "Days off",
      "Contests",
      "Timetable changes",
    ]);
  });

  type Editor = HTMLElement & { updateComplete: Promise<unknown>; hass: HomeAssistant; setConfig(c: object): void };
  type EditorForm = HTMLElement & { data: ScheduleCardConfig; schema: FormField[] };
  type SelectConfig = { multiple: boolean; custom_value: boolean; options: { value: string; label: string }[] };

  async function editorWith(config: Partial<ScheduleCardConfig>): Promise<Editor> {
    const editor = await mount<Editor>(SCHEDULE_EDITOR, (el) => {
      el.hass = hassWith([TEST, TRIP, MEETING, QUIZ, PLAIN]);
      el.setConfig({ type: `custom:${SCHEDULE_CARD}`, entity: ENTITY, ...config });
    });
    await settle(editor);
    return editor;
  }

  it("editor offers the same options for the blacklist, with the types of both lists", async () => {
    const editor = await editorWith({ types: ["group:tests"], exclude_types: ["Projekt", "Apel"] });
    const form = editor.shadowRoot!.querySelector("ha-form") as EditorForm;
    const select = (name: string) => form.schema.find((f) => f.name === name)!.selector!.select as SelectConfig;

    const order = form.schema.map((f) => f.name);
    expect(order.indexOf("exclude_types")).toBe(order.indexOf("types") + 1);
    expect(select("exclude_types").multiple && select("exclude_types").custom_value).toBe(true);
    expect(select("exclude_types").options).toEqual(select("types").options);
    // "Projekt" (only in the blacklist) is offered once; "Apel" is in the data already.
    const values = select("types").options.map((o) => o.value);
    expect(values.filter((v) => v === "Projekt")).toHaveLength(1);
    expect(values.filter((v) => v === "Apel")).toHaveLength(1);
    expect(form.data.exclude_types).toEqual(["Projekt", "Apel"]);
    expect(form.data.types).toEqual(["group:tests"]);
  });

  it("editor labels the blacklist in Polish and English", () => {
    expect(localize(mockHass({}, "pl"), "editor.exclude_types")).toBe("Wykluczone rodzaje wydarzeń (puste: żadne)");
    expect(localize(mockHass({}, "en"), "editor.exclude_types")).toBe("Excluded event types (empty: none)");
  });

  it("editor sends exclude_types and does not write an empty type list", async () => {
    const editor = await editorWith({});
    const form = editor.shadowRoot!.querySelector("ha-form") as EditorForm;
    const changes: ScheduleCardConfig[] = [];
    editor.addEventListener("config-changed", (e) => changes.push((e as CustomEvent).detail.config));
    expect(form.data).not.toHaveProperty("exclude_types");

    form.dispatchEvent(new CustomEvent("value-changed", { detail: { value: { ...form.data, exclude_types: ["group:tests"] } } }));
    await editor.updateComplete;
    // The lists are cleared again; `fields: []` ("title only") is not an unset list and stays.
    form.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { ...form.data, types: [], exclude_types: [], fields: [] } } }),
    );

    expect(changes[0].exclude_types).toEqual(["group:tests"]);
    expect(changes[1]).not.toHaveProperty("types");
    expect(changes[1]).not.toHaveProperty("exclude_types");
    expect(changes[1].fields).toEqual([]);
  });
});
