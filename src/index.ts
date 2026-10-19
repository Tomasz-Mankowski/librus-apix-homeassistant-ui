// Entry point: defines the custom elements and lists the cards in the card picker.

import {
  MESSAGES_CARD,
  MESSAGES_EDITOR,
  MessagesCard,
  MessagesCardEditor,
} from "./cards/messages-card";
import { DIALOG, LibrusDialog } from "./common/dialog";
import type { CustomCardEntry } from "./types";

const ELEMENTS: [string, CustomElementConstructor][] = [
  [DIALOG, LibrusDialog],
  [MESSAGES_CARD, MessagesCard],
  [MESSAGES_EDITOR, MessagesCardEditor],
];

const CARDS: CustomCardEntry[] = [
  {
    type: MESSAGES_CARD,
    name: "Librus messages",
    description: "Last Librus messages of a student with read and attachment marks.",
    preview: true,
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
