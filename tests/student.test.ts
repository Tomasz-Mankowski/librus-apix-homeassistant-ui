import { describe, expect, it } from "vitest";

import { averageLevel, levelColor } from "../src/common/colors";
import { deviceField, headerFields, subjectsField } from "../src/common/editor";
import {
  SUBJECT_DESCRIPTIVE,
  SUBJECT_GRADES,
  deviceEntities,
  gpaEntity,
  studentDevices,
  subjectName,
  subjects,
} from "../src/common/student";
import type { EntityRegistryDisplayEntry, HomeAssistant } from "../src/types";
import { mockHass } from "./helpers";

const ZOFIA = "device-zofia";
const KACPER = "device-kacper";

function entry(
  entity_id: string,
  device_id: string | null,
  translation_key?: string,
  platform = "librus_apix",
): EntityRegistryDisplayEntry {
  return { entity_id, device_id, translation_key, platform };
}

/** Registry and states of two students and one entity of another integration. */
function studentsHass(): HomeAssistant {
  const hass = mockHass({
    "sensor.zofia_testowa_matematyka": { state: "3.69", attributes: { subject: "Matematyka" } },
    "sensor.zofia_testowa_jezyk_polski": { state: "4.0", attributes: { subject: "Język polski" } },
    "sensor.zofia_testowa_plastyka": { state: "unavailable", attributes: { friendly_name: "Zofia Testowa Plastyka" } },
    "sensor.zofia_testowa_edukacja_zdrowotna_oceny_opisowe": {
      state: "2",
      attributes: { subject: "Edukacja zdrowotna" },
    },
    "sensor.zofia_testowa_srednia_ocen": { state: "4.095" },
    "sensor.kacper_probny_fizyka": { state: "5.0", attributes: { subject: "Fizyka" } },
    "sensor.kacper_probny_srednia_ocen": { state: "4.125" },
  });
  hass.entities = Object.fromEntries(
    [
      entry("sensor.zofia_testowa_matematyka", ZOFIA, SUBJECT_GRADES),
      entry("sensor.zofia_testowa_jezyk_polski", ZOFIA, SUBJECT_GRADES),
      entry("sensor.zofia_testowa_plastyka", ZOFIA, SUBJECT_GRADES),
      entry("sensor.zofia_testowa_edukacja_zdrowotna_oceny_opisowe", ZOFIA, SUBJECT_DESCRIPTIVE),
      entry("sensor.zofia_testowa_srednia_ocen", ZOFIA, "gpa"),
      entry("sensor.zofia_testowa_klasa", ZOFIA, "class_name"),
      entry("sensor.kacper_probny_fizyka", KACPER, SUBJECT_GRADES),
      entry("sensor.kacper_probny_srednia_ocen", KACPER, "gpa"),
      // Same device, other integration: never a subject.
      entry("sensor.zofia_other", ZOFIA, SUBJECT_GRADES, "other_integration"),
      entry("sensor.no_device", null, SUBJECT_GRADES),
    ].map((e) => [e.entity_id, e]),
  );
  return hass;
}

describe("student entities", () => {
  it("finds the subject sensors of the device, sorted by subject name", () => {
    expect(subjects(studentsHass(), ZOFIA, SUBJECT_GRADES)).toEqual([
      { entity_id: "sensor.zofia_testowa_jezyk_polski", name: "Język polski" },
      { entity_id: "sensor.zofia_testowa_matematyka", name: "Matematyka" },
      { entity_id: "sensor.zofia_testowa_plastyka", name: "Zofia Testowa Plastyka" },
    ]);
  });

  it("finds the descriptive grades and the GPA sensor", () => {
    const hass = studentsHass();
    expect(subjects(hass, ZOFIA, SUBJECT_DESCRIPTIVE)).toEqual([
      { entity_id: "sensor.zofia_testowa_edukacja_zdrowotna_oceny_opisowe", name: "Edukacja zdrowotna" },
    ]);
    expect(gpaEntity(hass, ZOFIA)).toBe("sensor.zofia_testowa_srednia_ocen");
    expect(gpaEntity(hass, KACPER)).toBe("sensor.kacper_probny_srednia_ocen");
  });

  it("ignores other devices and other integrations", () => {
    const hass = studentsHass();
    expect(subjects(hass, KACPER, SUBJECT_GRADES).map((s) => s.name)).toEqual(["Fizyka"]);
    expect(subjects(hass, KACPER, SUBJECT_DESCRIPTIVE)).toEqual([]);
    expect(deviceEntities(hass, ZOFIA).map((e) => e.entity_id)).not.toContain("sensor.zofia_other");
    expect(deviceEntities(hass, "unknown-device")).toEqual([]);
  });

  it("finds nothing without a device or a registry", () => {
    const hass = studentsHass();
    expect(subjects(hass, undefined, SUBJECT_GRADES)).toEqual([]);
    expect(subjects(undefined, ZOFIA, SUBJECT_GRADES)).toEqual([]);
    expect(subjects(mockHass(), ZOFIA, SUBJECT_GRADES)).toEqual([]);
    expect(gpaEntity(mockHass(), ZOFIA)).toBeUndefined();
  });

  it("lists the devices that have subject sensors", () => {
    const hass = studentsHass();
    expect(studentDevices(hass, SUBJECT_GRADES)).toEqual([ZOFIA, KACPER]);
    expect(studentDevices(hass, SUBJECT_DESCRIPTIVE)).toEqual([ZOFIA]);
    expect(studentDevices(undefined, SUBJECT_GRADES)).toEqual([]);
  });

  it("names a subject without state by its entity id", () => {
    expect(subjectName(mockHass(), "sensor.missing")).toBe("sensor.missing");
  });
});

describe("GPA levels (lower bounds, D-116)", () => {
  const levels = { level_bad: 2, level_ok: 3, level_excellent: 4.5 };

  it.each([
    [1.5, undefined],
    [2, "bad"],
    [2.99, "bad"],
    [3, "ok"],
    [4.49, "ok"],
    [4.5, "excellent"],
    [6, "excellent"],
  ])("average %s is %s", (average, level) => {
    expect(averageLevel(average, levels)).toBe(level);
  });

  it("skips empty levels", () => {
    expect(averageLevel(3.5, { level_bad: 2, level_ok: "", level_excellent: 4.5 })).toBe("bad");
    expect(averageLevel(3.5, { level_ok: null, level_excellent: 4 })).toBeUndefined();
    expect(averageLevel(5, {})).toBeUndefined();
  });

  it("reads levels written as text, also with a decimal comma", () => {
    expect(averageLevel(4.6, { level_excellent: "4,5" })).toBe("excellent");
    expect(averageLevel(4.6, { level_excellent: "x" })).toBeUndefined();
  });

  it("has no level without an average", () => {
    expect(averageLevel(null, levels)).toBeUndefined();
    expect(averageLevel(undefined, levels)).toBeUndefined();
    expect(averageLevel(Number.NaN, levels)).toBeUndefined();
  });

  it("colours by level: defaults, theme names and own colours", () => {
    expect(levelColor(2.5, levels)).toBe("var(--red-color)");
    expect(levelColor(3.5, levels)).toBe("var(--amber-color)");
    expect(levelColor(5, levels)).toBe("var(--green-color)");
    expect(levelColor(5, { ...levels, color_excellent: "blue" })).toBe("var(--blue-color)");
    expect(levelColor(2.5, { ...levels, color_bad: "#ff0000" })).toBe("#ff0000");
    expect(levelColor(1, levels)).toBeUndefined();
  });
});

describe("editor fields", () => {
  it("picks a device of the Librus integration", () => {
    expect(deviceField()).toEqual({
      name: "device",
      required: true,
      selector: { device: { filter: [{ integration: "librus_apix" }] } },
    });
  });

  it("offers the found subjects and keeps configured ones that are not found", () => {
    const field = subjectsField("exclude", ["Język polski", "Matematyka"], ["Matematyka", "Religia"]);
    expect(field.name).toBe("exclude");
    expect(field.selector).toEqual({
      select: {
        multiple: true,
        custom_value: true,
        options: [
          { value: "Język polski", label: "Język polski" },
          { value: "Matematyka", label: "Matematyka" },
          { value: "Religia", label: "Religia" },
        ],
      },
    });
    expect(subjectsField("exclude", []).selector).toMatchObject({ select: { options: [] } });
  });

  it("has the header fields in one grid", () => {
    expect(headerFields().schema?.map((f) => f.name)).toEqual(["title", "icon", "icon_color"]);
  });
});
