import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/index";
import {
  SCHEDULE_CARD,
  SCHEDULE_EDITOR,
  ScheduleCard,
  type ScheduleCardConfig,
} from "../src/cards/schedule-card";
import type { LibrusDialog } from "../src/common/dialog";
import type { FormField } from "../src/common/editor";
import type { CalendarApiEvent } from "../src/common/schedule";
import type { HomeAssistant } from "../src/types";
import { mockHass, mount } from "./helpers";
import { MEETING, NOW, PAST, TEST, TRIP } from "./schedule-data";

const ENTITY = "calendar.zofia_testowa_terminarz";

type ApiMock = ReturnType<typeof vi.fn>;

function hassWith(events: CalendarApiEvent[] | Error, language = "pl", calendarState = "off"): HomeAssistant {
  const hass = mockHass({ [ENTITY]: { state: calendarState, attributes: { message: "x" } } }, language);
  hass.callApi = vi.fn(async () => {
    if (events instanceof Error) {
      throw events;
    }
    return events;
  }) as unknown as HomeAssistant["callApi"];
  return hass;
}

async function settle(card: ScheduleCard): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await card.updateComplete;
  }
}

async function card(
  config: Partial<ScheduleCardConfig> = {},
  events: CalendarApiEvent[] | Error = [TEST, TRIP, MEETING, PAST],
  language = "pl",
): Promise<ScheduleCard> {
  const el = await mount<ScheduleCard>(SCHEDULE_CARD, (c) => {
    c.setConfig({ type: `custom:${SCHEDULE_CARD}`, entity: ENTITY, ...config });
    c.hass = hassWith(events, language);
  });
  await settle(el);
  return el;
}

function rows(el: ScheduleCard): HTMLLIElement[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLLIElement>("ul.items > li")];
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("schedule card", () => {
  it("is defined and listed in the card picker", () => {
    expect(customElements.get(SCHEDULE_CARD)).toBe(ScheduleCard);
    expect(window.customCards?.find((c) => c.type === SCHEDULE_CARD)?.name).toBe("Librus schedule");
  });

  it("asks for the next 14 days by default", async () => {
    const el = await card();

    expect(el.hass!.callApi).toHaveBeenCalledWith(
      "GET",
      `calendars/${ENTITY}?start=2026-10-19T08%3A00%3A00.000Z&end=2026-11-02T08%3A00%3A00.000Z`,
    );
  });

  it("asks for the configured number of days", async () => {
    const el = await card({ days: 3 });
    const path = (el.hass!.callApi as unknown as ApiMock).mock.calls[0][1] as string;
    expect(path).toContain("end=2026-10-22T08%3A00%3A00.000Z");
  });

  it("lists only events inside the timeframe, sorted by start", async () => {
    const el = await card({ days: 7 });

    expect(rows(el).map((row) => row.querySelector(".title")!.textContent)).toEqual([
      "Sprawdzian: Matematyka",
      "Wycieczka: Muzeum Techniki",
    ]);
  });

  it("highlights the nearest event", async () => {
    const [first, second] = rows(await card());

    expect(first.className).toBe("next");
    expect(first.querySelector(".next-label")!.textContent).toBe("Najbliższe");
    expect(second.className).toBe("");
    expect(second.querySelector(".next-label")).toBeNull();
  });

  it("shows the date badge, times, lesson and description", async () => {
    const [test, trip, meeting] = rows(await card());

    expect(test.querySelector(".day")!.textContent).toBe("21");
    expect(test.querySelector(".weekday")!.textContent).toBe("śr.");
    expect(test.querySelector(".meta")!.textContent).toBe("09:50–10:35 · lekcja 3 · Ułamki zwykłe");
    expect(trip.querySelector(".day")!.textContent).toBe("23");
    expect(trip.querySelector(".meta")!.textContent).toBe("Cały dzień · Muzeum Techniki");
    expect(meeting.querySelector(".meta")!.textContent).toBe("17:00–18:00");
  });

  it("follows the fields option", async () => {
    const [test] = rows(await card({ fields: ["teacher"] }));

    expect(test.querySelector(".badge")).toBeNull();
    expect(test.querySelector(".meta")!.textContent).toBe("Adam Rachunek");

    const [bare] = rows(await card({ fields: [] }));
    expect(bare.querySelector(".meta")).toBeNull();
  });

  it("opens a pop-up with all details from the JSON line", async () => {
    const el = await card();

    rows(el)[0].querySelector("button")!.click();
    await settle(el);
    const dialog = el.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
    await dialog.updateComplete;

    expect(dialog.open).toBe(true);
    expect(dialog.heading).toBe("Sprawdzian: Matematyka");
    const details = [...dialog.querySelectorAll("dt")].map((dt) => [dt.textContent, dt.nextElementSibling!.textContent]);
    expect(details).toEqual([
      ["Rodzaj", "Sprawdzian"],
      ["Przedmiot", "Matematyka"],
      ["Data", "21.10.2026"],
      ["Godzina", "09:50–10:35"],
      ["Lekcja", "3"],
      ["Nauczyciel", "Adam Rachunek"],
      ["Dodano", "2026-10-09 12:00:00"],
      ["Sala", "12"],
    ]);
    expect(dialog.querySelector(".content")!.textContent).toBe("Ułamki zwykłe");
  });

  it("shows the description text of an event without our JSON line", async () => {
    const plain: CalendarApiEvent = { ...MEETING, description: "Spotkanie w auli" };
    const el = await card({}, [plain]);

    rows(el)[0].querySelector("button")!.click();
    await settle(el);
    const dialog = el.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
    expect(dialog.querySelector(".content")!.textContent).toBe("Spotkanie w auli");
  });

  it("says so when the timeframe has no events", async () => {
    const el = await card({ days: 1 }, [MEETING]);
    expect(el.shadowRoot!.querySelector(".empty")!.textContent).toBe(
      "Brak wydarzeń w ciągu najbliższych 1 dni",
    );
  });

  it("shows a readable error when the calendar cannot be read", async () => {
    const el = await card({}, Object.assign(new Error("Unable to get events"), {}), "en");
    expect(el.shadowRoot!.querySelector(".error")!.textContent).toBe("Something went wrong: Unable to get events");
  });

  it("reads again when the calendar changes, not for other entities", async () => {
    const el = await card();
    const callApi = el.hass!.callApi as unknown as ApiMock;
    expect(callApi).toHaveBeenCalledTimes(1);

    el.hass = { ...el.hass!, states: { ...el.hass!.states, "sensor.other": { ...el.hass!.states[ENTITY], entity_id: "sensor.other" } } };
    await settle(el);
    expect(callApi).toHaveBeenCalledTimes(1);

    el.hass = { ...el.hass!, states: { ...el.hass!.states, [ENTITY]: { ...el.hass!.states[ENTITY], state: "on" } } };
    await settle(el);
    expect(callApi).toHaveBeenCalledTimes(2);
  });

  it("reads again on a timer while shown and stops when removed", async () => {
    const setSpy = vi.spyOn(window, "setInterval");
    const clearSpy = vi.spyOn(window, "clearInterval");
    const el = await card();

    expect(setSpy).toHaveBeenCalledWith(expect.any(Function), 15 * 60 * 1000);
    el.remove();
    expect(clearSpy).toHaveBeenCalled();
  });

  it.each([
    [{}, "Entity required"],
    [{ entity: ENTITY, days: 0 }, "days must be"],
    [{ entity: ENTITY, days: 201 }, "days must be"],
  ])("rejects config %j", (config, error) => {
    expect(() => new ScheduleCard().setConfig({ type: "x", ...config })).toThrow(error);
  });

  it("suggests a Librus calendar in the card picker", () => {
    const hass = mockHass({
      "calendar.holidays": { state: "off", attributes: { description: "x" } },
      [ENTITY]: { state: "off", attributes: { description: 'Rodzaj: X\n{"librus_apix": 1}' } },
    });
    expect(ScheduleCard.getStubConfig(hass).entity).toBe(ENTITY);
    expect(ScheduleCard.getStubConfig(mockHass({ "calendar.holidays": { state: "off" } })).entity).toBe(
      "calendar.holidays",
    );
  });
});

describe("schedule card editor", () => {
  it("offers entity, title, icon, days and fields with defaults", async () => {
    const editor = await mount<HTMLElement & { updateComplete: Promise<unknown>; hass: unknown; setConfig(c: object): void }>(
      SCHEDULE_EDITOR,
      (el) => {
        el.hass = mockHass({}, "pl");
        el.setConfig({ type: `custom:${SCHEDULE_CARD}`, entity: ENTITY });
      },
    );
    const form = editor.shadowRoot!.querySelector("ha-form") as HTMLElement & {
      data: ScheduleCardConfig;
      schema: FormField[];
      computeLabel: (field: FormField) => string;
    };

    expect(form.data).toMatchObject({ days: 14, fields: ["date", "time", "description"] });
    const names = form.schema.flatMap((f) => (f.schema ? f.schema.map((s) => s.name) : [f.name]));
    expect(names).toEqual(["entity", "title", "icon", "days", "fields", "types"]);
    expect(form.schema[0].selector).toEqual({ entity: { filter: [{ domain: "calendar", integration: "librus_apix" }] } });
    expect(form.computeLabel({ name: "days" })).toBe("Liczba dni do przodu");
  });
});
