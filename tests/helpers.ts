import type { HassEntity, HomeAssistant } from "../src/types";

/** A minimal `hass` object for card tests. */
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
    locale: { language },
    themes: { darkMode: false },
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
