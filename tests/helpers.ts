import type { HassEntity, HomeAssistant } from "../src/types";

/**
 * A minimal `hass` object for card tests. Times are shown in the server time zone
 * Europe/Warsaw, so results do not depend on the time zone of the test machine.
 */
export function mockHass(
  states: Record<string, Partial<HassEntity>> = {},
  language = "en",
): HomeAssistant {
  return {
    states: Object.fromEntries(
      Object.entries(states).map(([entityId, state]) => [
        entityId,
        {
          entity_id: entityId,
          state: "",
          attributes: {},
          last_changed: "2026-10-19T08:00:00+00:00",
          last_updated: "2026-10-19T08:00:00+00:00",
          ...state,
        },
      ]),
    ),
    language,
    locale: { language, time_zone: "server" },
    config: { time_zone: "Europe/Warsaw" },
    themes: { darkMode: false },
    callWS: async <T>() => undefined as T,
    callApi: async <T>() => [] as T,
    callService: async () => undefined,
  };
}

/** Create an element, attach it to the document and wait for its first render. */
export async function mount<T extends HTMLElement & { updateComplete: Promise<unknown> }>(
  tag: string,
  setup: (element: T) => void = () => undefined,
): Promise<T> {
  const element = document.createElement(tag) as T;
  setup(element);
  document.body.append(element);
  await element.updateComplete;
  return element;
}
