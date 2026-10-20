// The parts of Home Assistant's frontend objects that the cards use.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

/** Entity registry entry the frontend keeps in `hass.entities` (HA frontend EntityRegistryDisplayEntry). */
export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string | null;
  device_id?: string | null;
  platform?: string;
  translation_key?: string;
  hidden?: boolean;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities?: Record<string, EntityRegistryDisplayEntry>;
  language: string;
  // time_zone "server" = show times in the HA time zone (config.time_zone).
  locale: { language: string; time_zone?: "local" | "server" };
  config?: { time_zone: string };
  themes: { darkMode: boolean };
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  // REST API under /api/ (path without the prefix).
  callApi<T>(method: "GET" | "POST", path: string, parameters?: Record<string, unknown>): Promise<T>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
    notifyOnError?: boolean,
    returnResponse?: boolean,
  ): Promise<unknown>;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

// Entry of window.customCards: lists a card in the dashboard card picker.
export interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
}
