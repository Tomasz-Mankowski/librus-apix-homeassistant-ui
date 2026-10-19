import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime, formatWallTime } from "../src/common/format";
import { mockHass } from "./helpers";

describe("formatDateTime", () => {
  it("uses the HA language", () => {
    expect(formatDateTime(mockHass({}, "pl"), "2026-10-19T17:07:40+02:00")).toBe("19.10.2026, 17:07");
    expect(formatDateTime(mockHass({}, "en"), "2026-10-19T17:07:40+02:00")).toBe("10/19/26, 5:07 PM");
  });

  it("uses the server time zone when HA is set to it", () => {
    const hass = mockHass({}, "pl");
    hass.locale = { language: "pl", time_zone: "server" };
    hass.config = { time_zone: "America/New_York" };
    expect(formatDateTime(hass, "2026-10-19T17:07:40+02:00")).toBe("19.10.2026, 11:07");
  });

  it("keeps a text that is not a date", () => {
    expect(formatDateTime(mockHass(), "wczoraj")).toBe("wczoraj");
    expect(formatDateTime(mockHass(), "")).toBe("");
  });
});

describe("formatDate", () => {
  it("shows a plain date the same in every time zone", () => {
    const hass = mockHass({}, "pl");
    hass.locale = { language: "pl", time_zone: "server" };
    hass.config = { time_zone: "Pacific/Kiritimati" };
    expect(formatDate(hass, "2026-10-19")).toBe("19.10.2026");
    expect(formatDate(mockHass({}, "en"), "2026-10-19")).toBe("10/19/26");
  });

  it("formats a date-time as a date", () => {
    expect(formatDate(mockHass({}, "pl"), "2026-10-19T08:00:00+02:00")).toBe("19.10.2026");
  });
});

describe("formatWallTime", () => {
  it("shows a Librus school time without a time-zone shift", () => {
    const hass = mockHass({}, "pl");
    hass.config = { time_zone: "America/New_York" };
    expect(formatWallTime(hass, "2026-10-09 12:00:00")).toBe("9.10.2026, 12:00");
    expect(formatWallTime(mockHass({}, "en"), "2026-10-09 12:00:00")).toBe("10/9/26, 12:00 PM");
  });

  it("keeps other texts", () => {
    expect(formatWallTime(mockHass(), "wczoraj")).toBe("wczoraj");
  });
});
