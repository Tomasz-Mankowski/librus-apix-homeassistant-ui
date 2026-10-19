import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/index";
import { SCHEDULE_CARD, SCHEDULE_EDITOR, type ScheduleCard, type ScheduleCardConfig } from "../src/cards/schedule-card";
import type { FormField } from "../src/common/editor";
import { TYPE_GROUPS, eventType, filterByType, typesIn } from "../src/common/event-types";
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

describe("schedule card type filter", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  function hassWith(events: CalendarApiEvent[]): HomeAssistant {
    const hass = mockHass({ [ENTITY]: { state: "off" } }, "pl");
    hass.callApi = vi.fn(async () => events) as unknown as HomeAssistant["callApi"];
    return hass;
  }

  async function settle(el: HTMLElement & { updateComplete: Promise<unknown> }): Promise<void> {
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await el.updateComplete;
    }
  }

  async function card(types: string[]): Promise<ScheduleCard> {
    const el = await mount<ScheduleCard>(SCHEDULE_CARD, (c) => {
      c.setConfig({ type: `custom:${SCHEDULE_CARD}`, entity: ENTITY, types });
      c.hass = hassWith([TEST, TRIP, MEETING, QUIZ, PLAIN]);
    });
    await settle(el);
    return el;
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
      "Brak wydarzeń wybranych rodzajów w ciągu najbliższych 14 dni",
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
});
