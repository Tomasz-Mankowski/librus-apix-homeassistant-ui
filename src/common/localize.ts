// UI texts in English and Polish (F15). Librus content is never translated.

import en from "../translations/en.json";
import pl from "../translations/pl.json";
import type { HomeAssistant } from "../types";

type Texts = { [key: string]: string | Texts };

const TEXTS: Record<Language, Texts> = { en, pl };

export type Language = "en" | "pl";

/** Polish for any Polish locale (pl, pl-PL), English for everything else. */
export function language(hass?: HomeAssistant): Language {
  const lang = hass?.locale?.language ?? hass?.language ?? "en";
  return lang.toLowerCase().startsWith("pl") ? "pl" : "en";
}

function lookup(texts: Texts, key: string): string | undefined {
  let node: string | Texts | undefined = texts;
  for (const part of key.split(".")) {
    if (typeof node !== "object") {
      return undefined;
    }
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Text for a dotted key ("common.close"); English if the key has no Polish text,
 * the key itself if it has none at all. "{name}" is replaced by params.name.
 */
export function localize(
  hass: HomeAssistant | undefined,
  key: string,
  params: Record<string, string | number> = {},
): string {
  const text = lookup(TEXTS[language(hass)], key) ?? lookup(TEXTS.en, key) ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
