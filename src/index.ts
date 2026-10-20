// Entry point: defines the custom elements and lists the cards in the card picker.

import {
  ANNOUNCEMENTS_CARD,
  ANNOUNCEMENTS_EDITOR,
  AnnouncementsCard,
  AnnouncementsCardEditor,
} from "./cards/announcements-card";
import {
  MESSAGES_CARD,
  MESSAGES_EDITOR,
  MessagesCard,
  MessagesCardEditor,
} from "./cards/messages-card";
import {
  SCHEDULE_CARD,
  SCHEDULE_EDITOR,
  ScheduleCard,
  ScheduleCardEditor,
} from "./cards/schedule-card";
import { GRADES_CARD, GRADES_EDITOR, GradesCard, GradesCardEditor } from "./cards/grades-card";
import { DIALOG, LibrusDialog } from "./common/dialog";
import type { CustomCardEntry } from "./types";

const ELEMENTS: [string, CustomElementConstructor][] = [
  [DIALOG, LibrusDialog],
  [MESSAGES_CARD, MessagesCard],
  [MESSAGES_EDITOR, MessagesCardEditor],
  [ANNOUNCEMENTS_CARD, AnnouncementsCard],
  [ANNOUNCEMENTS_EDITOR, AnnouncementsCardEditor],
  [SCHEDULE_CARD, ScheduleCard],
  [SCHEDULE_EDITOR, ScheduleCardEditor],
  [GRADES_CARD, GradesCard],
  [GRADES_EDITOR, GradesCardEditor],
];

const CARDS: CustomCardEntry[] = [
  {
    type: SCHEDULE_CARD,
    name: "Librus schedule",
    description: "Upcoming Librus schedule events (tests, trips, meetings) of a student.",
    preview: true,
  },
  {
    type: MESSAGES_CARD,
    name: "Librus messages",
    description: "Last Librus messages of a student with read and attachment marks.",
    preview: true,
  },
  {
    type: ANNOUNCEMENTS_CARD,
    name: "Librus announcements",
    description: "Last Librus announcements of a student's school with the full text in a pop-up.",
    preview: true,
  },
  {
    type: GRADES_CARD,
    name: "Librus grades",
    description: "Grades of a student by subject with averages, the GPA and colour levels.",
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
