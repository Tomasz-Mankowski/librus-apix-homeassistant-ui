// Entry point: defines the custom elements and lists the cards in the card picker.

import { PLACEHOLDER_CARD, PlaceholderCard } from "./cards/placeholder-card";
import type { CustomCardEntry } from "./types";

const CARDS: { tag: string; element: CustomElementConstructor; entry: CustomCardEntry }[] = [
  {
    tag: PLACEHOLDER_CARD,
    element: PlaceholderCard,
    entry: {
      type: PLACEHOLDER_CARD,
      name: "Librus APIX placeholder",
      description: "Shows the version of the Librus APIX Cards bundle.",
    },
  },
];

for (const { tag, element, entry } of CARDS) {
  // The bundle can be loaded twice (for example two resources): define once.
  if (!customElements.get(tag)) {
    customElements.define(tag, element);
    window.customCards = window.customCards ?? [];
    window.customCards.push(entry);
  }
}
