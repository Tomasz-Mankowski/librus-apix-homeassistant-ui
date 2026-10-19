import { describe, expect, it, vi } from "vitest";

import { eventsInRange, fetchEvents, parseDescription, toScheduleEvent } from "../src/common/schedule";
import type { HomeAssistant } from "../src/types";
import { mockHass } from "./helpers";
import { MEETING, NOW, PAST, TEST, TRIP, description } from "./schedule-data";

describe("parseDescription", () => {
  it("reads our JSON line and keeps the readable lines as text", () => {
    const { text, fields } = parseDescription(TEST.description);

    expect(text).toBe("Data: 2026-10-21\nNr lekcji: 3\nRodzaj: Sprawdzian");
    expect(fields).toMatchObject({ type: "Sprawdzian", subject: "Matematyka", lesson: 3, teacher: "Adam Rachunek" });
    expect(fields).not.toHaveProperty("librus_apix");
  });

  it.each([
    ["no JSON line", "Rodzaj: Sprawdzian"],
    ["another JSON object", 'Rodzaj: X\n{"other": 1}'],
    ["broken JSON", "Rodzaj: X\n{not json"],
  ])("gives only text for %s", (_, text) => {
    expect(parseDescription(text)).toEqual({ text });
  });

  it("handles a missing description", () => {
    expect(parseDescription(null)).toEqual({ text: "" });
    expect(parseDescription(undefined)).toEqual({ text: "" });
  });
});

describe("toScheduleEvent", () => {
  it("converts timed and all-day events", () => {
    const timed = toScheduleEvent(TEST);
    expect(timed).toMatchObject({ uid: "szczegoly/3003", allDay: false, date: undefined });
    expect(timed.start.toISOString()).toBe("2026-10-21T07:50:00.000Z");

    const allDay = toScheduleEvent(TRIP);
    expect(allDay).toMatchObject({ allDay: true, date: "2026-10-23" });
    expect(allDay.end.getTime() - allDay.start.getTime()).toBe(24 * 3600 * 1000);
  });

  it("falls back to the JSON id or summary and start for the uid", () => {
    expect(toScheduleEvent({ ...TEST, uid: null }).uid).toBe("szczegoly/3003");
    const plain = toScheduleEvent({ ...MEETING, uid: undefined, description: "" });
    expect(plain.uid).toBe("Zebranie z rodzicami|2026-10-28T16:00:00.000Z");
  });
});

describe("eventsInRange", () => {
  it("keeps events that end after now and start before the end, sorted by start", () => {
    const events = [MEETING, TRIP, PAST, TEST].map(toScheduleEvent);
    const until = new Date("2026-10-26T00:00:00Z");

    expect(eventsInRange(events, NOW, until).map((e) => e.summary)).toEqual([
      "Sprawdzian: Matematyka",
      "Wycieczka: Muzeum Techniki",
    ]);
  });

  it("keeps an event that is running now", () => {
    const running = toScheduleEvent({
      ...PAST,
      start: { dateTime: "2026-10-19T09:50:00+02:00" },
      end: { dateTime: "2026-10-19T10:35:00+02:00" },
    });
    expect(eventsInRange([running], NOW, new Date("2026-10-20T00:00:00Z"))).toHaveLength(1);
  });
});

describe("fetchEvents", () => {
  it("asks the calendar REST API for the time range", async () => {
    const hass = mockHass();
    const callApi = vi.fn(async () => [MEETING, TEST, { ...PAST, description: description({}) }]);
    hass.callApi = callApi as unknown as HomeAssistant["callApi"];
    const until = new Date("2026-11-02T08:00:00Z");

    const events = await fetchEvents(hass, "calendar.zofia_testowa_terminarz", NOW, until);

    expect(callApi).toHaveBeenCalledWith(
      "GET",
      "calendars/calendar.zofia_testowa_terminarz?start=2026-10-19T08%3A00%3A00.000Z&end=2026-11-02T08%3A00%3A00.000Z",
    );
    expect(events.map((e) => e.summary)).toEqual(["Sprawdzian: Matematyka", "Zebranie z rodzicami"]);
  });
});
