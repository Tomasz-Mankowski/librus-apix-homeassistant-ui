# `librus-apix-homeassistant-ui` - Karty HA dla  `librus-apix-homeassistant`

Karty do panelu Home Assistant (HACS, kategoria „Dashboard”) dla integracji [librus-apix-homeassistant](https://github.com/Tomasz-Mankowski/librus-apix-homeassistant). Pokazują terminarz, wiadomości i ogłoszenia z Librus Synergia.

> [!IMPORTANT]
> Projekt nieoficjalny. **Nie jest powiązany z firmą Librus** ani przez nią wspierany.

| Terminarz | Wiadomości | Ogłoszenia |
|---|---|---|
| ![Karta terminarza](docs/schedule-card.png) | ![Karta wiadomości](docs/messages-card.png) | ![Karta ogłoszeń](docs/announcements-card.png) |

## Instalacja

[![Otwórz repozytorium w HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Tomasz-Mankowski&repository=librus-apix-homeassistant-ui&category=plugin)

Lub ręcznie:

1. HACS → menu **⋮** → **Własne repozytoria**.
2. Repozytorium: `https://github.com/Tomasz-Mankowski/librus-apix-homeassistant-ui`, typ: **Dashboard**.
3. Znajdź **Librus APIX Cards** w HACS i kliknij **Pobierz**. HACS sam dodaje zasób panelu.
4. Odśwież przeglądarkę.

## Wymagania

- Home Assistant 2026.3 lub nowszy.
- Zainstalowana i skonfigurowana integracja [librus-apix-homeassistant](https://github.com/Tomasz-Mankowski/librus-apix-homeassistant).
- [HACS](https://hacs.xyz/).

## Opcje wspólne

| Opcja | Opis | Domyślnie |
|---|---|---|
| `entity` | encja ucznia (wymagana, patrz każda karta) | — |
| `title` | tytuł karty; pusty tekst `""` ukrywa nagłówek | nazwa karty |
| `icon` | ikona w nagłówku, np. `mdi:school` | ikona karty |
| `icon_color` | kolor ikony | kolor ikon motywu |

Kolory (`icon_color`, `unread_color`) wybierasz z palety Home Assistant: `primary`, `accent`, `red`, `pink`, `purple`, `deep-purple`, `indigo`, `blue`, `light-blue`, `cyan`, `teal`, `green`, `light-green`, `lime`, `yellow`, `amber`, `orange`, `deep-orange`, `brown`, `grey`, `blue-grey`, `black`, `white`. Działa też kolor szesnastkowy, np. `"#ff8800"`. Kolory z palety dopasowują się do motywu.

## Terminarz — `custom:librus-schedule-card`

Najbliższe wydarzenia z kalendarza ucznia. Najbliższe jest wyróżnione. Kliknięcie otwiera okno ze wszystkimi szczegółami.

| Opcja | Opis | Domyślnie |
|---|---|---|
| `entity` | kalendarz ucznia, np. `calendar.zofia_testowa_terminarz` | — |
| `days` | ile dni do przodu pokazać (1–200) | `14` |
| `fields` | co pokazać pod tytułem: `date` (data z lewej), `time` (godziny i numer lekcji), `description` (opis), `teacher` (nauczyciel) | `[date, time, description]` |
| `types` | tylko wybrane rodzaje wydarzeń (lista grup i nazw, patrz niżej); puste: wszystkie | wszystkie |
| `highlight_next` | wyróżnienie najbliższego wydarzenia (pasek i tło) | `true` |
| `show_next_label` | etykieta „Najbliższe” przy najbliższym wydarzeniu | `true` |

Grupy rodzajów dla `types`:

| Grupa | Rodzaje |
|---|---|
| `group:tests` | Sprawdzian, Kartkówka, Klasówka, Praca klasowa, Test |
| `group:trips` | Wycieczka, Wyjście |
| `group:meetings` | Zebranie z rodzicami, Wywiadówka, Konsultacje |
| `group:days_off` | Dzień wolny |
| `group:contests` | Konkurs, Olimpiada |
| `group:changes` | Zastępstwo, Odwołane zajęcia |

Każda szkoła może mieć własne rodzaje. Edytor pokazuje grupy i rodzaje znalezione w terminarzu ucznia; inny rodzaj możesz wpisać ręcznie.

```yaml
type: custom:librus-schedule-card
entity: calendar.zofia_testowa_terminarz
title: Sprawdziany
icon: mdi:file-document-edit-outline
icon_color: deep-orange
days: 30
types:
  - group:tests
```

Karta w ciemnym motywie:

![Terminarz w ciemnym motywie](docs/schedule-card-dark.png)

## Wiadomości — `custom:librus-messages-card`

Ostatnie wiadomości. Nieprzeczytane mają kolorową, zamkniętą kopertę i pogrubiony tytuł; spinacz oznacza załącznik. Kliknięcie otwiera okno ze szczegółami. Przycisk **Wczytaj treść** czyta treść z Librusa — Librus oznacza wtedy wiadomość jako przeczytaną. Treść przeczytana wcześniej otwiera się od razu.

![Okno wiadomości z treścią](docs/message-popup.png)

| Opcja | Opis | Domyślnie |
|---|---|---|
| `entity` | czujnik wiadomości ucznia, np. `sensor.zofia_testowa_wiadomosci` | — |
| `count` | ile ostatnich wiadomości pokazać (1–100) | `5` |
| `fields` | co pokazać: `author` (autor), `date` (data), `attachment` (ikona załącznika), `status` (ikona przeczytania) | wszystkie |
| `unread_color` | kolor oznaczenia nieprzeczytanych | `primary` |
| `highlight_unread` | wyróżnienie nieprzeczytanych wiadomości (pasek i tło w kolorze `unread_color`) | `false` |

```yaml
type: custom:librus-messages-card
entity: sensor.zofia_testowa_wiadomosci
count: 10
unread_color: red
highlight_unread: true
```

Integracja czyta tyle wiadomości, ile ustawiono w jej opcjach (domyślnie 20). `count` większy niż ta liczba pokaże ich tyle, ile jest.

## Ogłoszenia — `custom:librus-announcements-card`

Ostatnie ogłoszenia. Kliknięcie otwiera okno z pełną treścią.

| Opcja | Opis | Domyślnie |
|---|---|---|
| `entity` | czujnik ogłoszeń ucznia, np. `sensor.zofia_testowa_ogloszenia` | — |
| `count` | ile ostatnich ogłoszeń pokazać (1–100) | `5` |
| `fields` | co pokazać: `author` (autor), `date` (data), `preview` (pierwsza linia treści) | `[author, date]` |

```yaml
type: custom:librus-announcements-card
entity: sensor.zofia_testowa_ogloszenia
count: 3
fields:
  - date
  - preview
```

## Wygląd

- Karty używają kolorów i czcionek motywu Home Assistant, także ciemnego.
- Teksty są po polsku lub angielsku, według języka Home Assistant. Treści z Librusa zostają bez zmian.
- Okno szczegółów zamyka **Esc**, przycisk ✕ lub kliknięcie obok okna. Na telefonie okno zajmuje cały ekran.
- W widoku sekcji karta zajmuje całą szerokość sekcji, a jej wysokość zależy od liczby pozycji.

## Licencja

[MIT](LICENSE).