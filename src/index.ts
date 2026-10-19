// Entry point: defines the custom elements and lists the cards in the card picker.

import {
  PLACEHOLDER_CARD,
  PLACEHOLDER_EDITOR,
  PlaceholderCard,
  PlaceholderCardEditor,
} from "./cards/placeholder-card";
import { DIALOG, LibrusDialog } from "./common/dialog";
import type { CustomCardEntry } from "./types";

const ELEMENTS: [string, CustomElementConstructor][] = [
  [DIALOG, LibrusDialog],
  [PLACEHOLDER_CARD, PlaceholderCard],
  [PLACEHOLDER_EDITOR, PlaceholderCardEditor],
];

const CARDS: CustomCardEntry[] = [
  {
    type: PLACEHOLDER_CARD,
    name: "Librus APIX placeholder",
    description: "Shows the version of the Librus APIX Cards bundle.",
  },
];

// The bundle can be loaded twice (for example two resources): define once.
for (const [tag, element] of ELEMENTS) {
  if (!customElements.get(tag)) {
    customElements.define(tag, element);
  }
}
window.customCards = window.customCards ?? [];
for (const card of CARDS) {
  if (!window.customCards.some((entry) => entry.type === card.type)) {
    window.customCards.push(card);
  }
}
