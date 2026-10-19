import { describe, expect, it } from "vitest";

import { language, localize } from "../src/common/localize";
import en from "../src/translations/en.json";
import pl from "../src/translations/pl.json";
import { mockHass } from "./helpers";

function keys(texts: object, prefix = ""): string[] {
  return Object.entries(texts).flatMap(([key, value]) =>
    typeof value === "object" ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

describe("language", () => {
  it.each([
    ["pl", "pl"],
    ["pl-PL", "pl"],
    ["PL", "pl"],
    ["en", "en"],
    ["de", "en"],
    ["en-GB", "en"],
  ])("%s -> %s", (locale, expected) => {
    expect(language(mockHass({}, locale))).toBe(expected);
  });

  it("is English without hass", () => {
    expect(language(undefined)).toBe("en");
  });
});

describe("localize", () => {
  it("switches with hass.locale.language", () => {
    expect(localize(mockHass({}, "pl"), "common.close")).toBe("Zamknij");
    expect(localize(mockHass({}, "en"), "common.close")).toBe("Close");
    expect(localize(mockHass({}, "fr"), "common.close")).toBe("Close");
  });

  it("fills in parameters and keeps unknown ones", () => {
    const hass = mockHass({}, "pl");
    expect(localize(hass, "common.entity_not_found", { entity: "calendar.x" })).toBe(
      "Nie znaleziono encji: calendar.x",
    );
    expect(localize(hass, "common.entity_not_found")).toBe("Nie znaleziono encji: {entity}");
  });

  it("returns the key when no language has the text", () => {
    expect(localize(mockHass(), "nothing.here")).toBe("nothing.here");
    expect(localize(mockHass(), "common")).toBe("common");
  });

  it("has the same keys in English and Polish", () => {
    expect(keys(pl).sort()).toEqual(keys(en).sort());
  });
});
