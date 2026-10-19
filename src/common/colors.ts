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
