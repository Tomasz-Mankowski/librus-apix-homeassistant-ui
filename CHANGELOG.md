# Changelog

All notable changes of the `librus-apix-homeassistant-ui` dashboard cards.
Versions follow [Semantic Versioning](https://semver.org/).

## 1.0.0 — 2026-10-19

First release. Requires Home Assistant 2026.3 or newer and the
[librus-apix-homeassistant](https://github.com/Tomasz-Mankowski/librus-apix-homeassistant) integration 1.0.0.

### Cards

- `custom:librus-schedule-card`: next events of the student's calendar (1–200 days), the next one
  highlighted with an optional "Nearest" label, shown fields, and a type filter with the groups
  tests, trips, meetings, days off, contests and timetable changes.
- `custom:librus-messages-card`: last messages (1–100) with author, date, attachment and read-status
  fields; a configurable unread colour and an optional highlight; the content is read only on request.
- `custom:librus-announcements-card`: last announcements (1–100) with an optional preview line.

### All cards

- Visual editor for every option; title, icon and icon colour.
- Pop-up with all details; closes with Esc, the close button or a click outside; full screen on
  phones.
- Home Assistant theme colours and fonts (light and dark); Polish and English texts.
