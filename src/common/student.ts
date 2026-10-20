// Entities of one Librus student (one device per student) for the grades cards
// (D-115): found in the entity registry the frontend keeps in `hass.entities`, by
// device, integration and translation key, so entity renames do not matter.

import type { EntityRegistryDisplayEntry, HomeAssistant } from "../types";

/** Integration of the entities. */
export const PLATFORM = "librus_apix";

/** translation_key of the sensors the grades cards read. */
export const SUBJECT_GRADES = "subject_grades";
export const SUBJECT_DESCRIPTIVE = "subject_descriptive";
export const GPA = "gpa";

export type SubjectKind = typeof SUBJECT_GRADES | typeof SUBJECT_DESCRIPTIVE;

/** A subject sensor: its entity and the subject name as Librus writes it. */
export interface Subject {
  entity_id: string;
  name: string;
}

/** Librus entities of the device (none without a device or registry). */
export function deviceEntities(
  hass: HomeAssistant | undefined,
  deviceId: string | undefined,
): EntityRegistryDisplayEntry[] {
  if (!hass?.entities || !deviceId) {
    return [];
  }
  return Object.values(hass.entities).filter(
    (entry) => entry.device_id === deviceId && entry.platform === PLATFORM,
  );
}

/** Subject name: the sensor's `subject` attribute, else its friendly name. */
export function subjectName(hass: HomeAssistant, entityId: string): string {
  const attributes = hass.states[entityId]?.attributes ?? {};
  const subject = attributes.subject;
  if (typeof subject === "string" && subject) {
    return subject;
  }
  const friendly = attributes.friendly_name;
  return typeof friendly === "string" && friendly ? friendly : entityId;
}

/** Subject sensors of the student (grades or descriptive grades), sorted by name. */
export function subjects(
  hass: HomeAssistant | undefined,
  deviceId: string | undefined,
  kind: SubjectKind,
): Subject[] {
  if (!hass) {
    return [];
  }
  return deviceEntities(hass, deviceId)
    .filter((entry) => entry.translation_key === kind)
    .map((entry) => ({ entity_id: entry.entity_id, name: subjectName(hass, entry.entity_id) }))
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

/** The student's GPA sensor. */
export function gpaEntity(
  hass: HomeAssistant | undefined,
  deviceId: string | undefined,
): string | undefined {
  return deviceEntities(hass, deviceId).find((entry) => entry.translation_key === GPA)?.entity_id;
}

/** Devices that have Librus subject sensors (for the card picker's suggestion). */
export function studentDevices(hass: HomeAssistant | undefined, kind: SubjectKind): string[] {
  const devices = new Set<string>();
  for (const entry of Object.values(hass?.entities ?? {})) {
    if (entry.platform === PLATFORM && entry.translation_key === kind && entry.device_id) {
      devices.add(entry.device_id);
    }
  }
  return [...devices];
}
