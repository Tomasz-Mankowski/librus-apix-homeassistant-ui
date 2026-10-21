# Changelog

All notable changes of the `librus-apix-homeassistant-ui` dashboard cards.
Versions follow [Semantic Versioning](https://semver.org/).

## 1.1.1 — 2026-10-21

- `custom:librus-descriptive-grades-card`: option `show_count` shows or hides the count of grades on
  the right of each row; option `show_latest` shows or hides the line with the latest grade under
  the grade codes. Both are `true` by default and have a switch in the card editor, so dashboards
  made with 1.1.0 keep their look.

## 1.1.0 — 2026-10-21

The cards are now called **HALibrus Cards**. The card types (`custom:librus-*`) stay.

### Added

- `custom:librus-grades-card`: one row per subject with the grades of the current semester, the
  subject average and the student's GPA; hidden subjects; three average levels with colours; a
  pop-up per subject with all grades of both semesters, the averages and the semester and year
  grades (corrections marked); `popup_fields` chooses what the pop-up shows.
- `custom:librus-descriptive-grades-card`: one row per subject with the grade codes, the latest
  grade and the count; a compact pop-up with the full text of every grade; `popup_fields`.
- Both cards pick the student by device and offer the student's subjects in the editor.

### Changed

- Card picker names `HALibrus …`.
- Requires the HALibrus integration 1.1.0 for the correction marks in the grades pop-up.

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
