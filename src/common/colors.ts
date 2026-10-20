// Colours from HA's colour picker (the "ui_color" selector): theme colour names
// become theme variables, so the colours follow light, dark and custom themes.

/** Names the HA colour picker offers (HA frontend THEME_COLORS). */
export const THEME_COLORS = new Set([
  "primary",
  "accent",
  "disabled",
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "light-grey",
  "grey",
  "dark-grey",
  "blue-grey",
  "black",
  "white",
]);

/** CSS colour of a picker value: "red" → var(--red-color); "#ff0000" stays; "" / undefined → undefined. */
export function cssColor(color: string | undefined): string | undefined {
  if (!color || color === "none" || color === "state") {
    return undefined;
  }
  return THEME_COLORS.has(color) ? `var(--${color}-color)` : color;
}

/** GPA levels of the grades card (D-116): lower bounds and their colours. */
export interface LevelOptions {
  level_bad?: number | string | null;
  level_ok?: number | string | null;
  level_excellent?: number | string | null;
  color_bad?: string;
  color_ok?: string;
  color_excellent?: string;
}

export const LEVELS = ["excellent", "ok", "bad"] as const;
export type Level = (typeof LEVELS)[number];

/** Colours of the levels when the config sets none. */
export const DEFAULT_LEVEL_COLORS: Record<Level, string> = {
  bad: "red",
  ok: "amber",
  excellent: "green",
};

function bound(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const number = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : undefined;
}

/**
 * Level of an average: the highest level whose lower bound it reaches
 * (excellent, then ok, then bad). Empty levels are skipped; below every set level,
 * or without an average, there is none.
 */
export function averageLevel(average: number | null | undefined, options: LevelOptions): Level | undefined {
  if (average === null || average === undefined || !Number.isFinite(average)) {
    return undefined;
  }
  return LEVELS.find((level) => {
    const lower = bound(options[`level_${level}`]);
    return lower !== undefined && average >= lower;
  });
}

/** CSS colour of an average by the levels (undefined: no highlighting). */
export function levelColor(average: number | null | undefined, options: LevelOptions): string | undefined {
  const level = averageLevel(average, options);
  return level ? cssColor(options[`color_${level}`] || DEFAULT_LEVEL_COLORS[level]) : undefined;
}
