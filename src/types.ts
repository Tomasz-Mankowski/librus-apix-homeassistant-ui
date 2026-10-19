// The parts of Home Assistant's frontend objects that the cards use.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language: string;
  // time_zone "server" = show times in the HA time zone (config.time_zone).
  locale: { language: string; time_zone?: "local" | "server" };
  config?: { time_zone: string };
  themes: { darkMode: boolean };
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
