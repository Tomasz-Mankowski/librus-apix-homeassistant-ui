import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";

import { errorText } from "../common/api";
import { GROUP_PREFIX, TYPE_GROUPS, filterByType, typesIn } from "../common/event-types";
import { LibrusCard, type BaseCardConfig } from "../common/base-card";
import { DIALOG, type LibrusDialog } from "../common/dialog";
import { LibrusCardEditor, baseFields, type FormField } from "../common/editor";
import { dayParts, formatDate, formatDateTime, formatTime } from "../common/format";
import { localize } from "../common/localize";
import { fieldsField, listStyles } from "../common/list";
import { fetchEvents, type ScheduleEvent } from "../common/schedule";
import { cardStyles } from "../common/styles";
import type { HomeAssistant } from "../types";

export const SCHEDULE_CARD = "librus-schedule-card";
export const SCHEDULE_EDITOR = "librus-schedule-card-editor";

/** Elements of a list row that can be switched off (the summary is always shown). */
export const SCHEDULE_FIELDS = ["date", "time", "description", "teacher"] as const;
export type ScheduleField = (typeof SCHEDULE_FIELDS)[number];
export const DEFAULT_SCHEDULE_FIELDS: ScheduleField[] = ["date", "time", "description"];

export const DEFAULT_DAYS = 14;
export const MAX_DAYS = 200;
// New events can arrive without a state change of the calendar: read again this often.
export const REFRESH_MS = 15 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ScheduleCardConfig extends BaseCardConfig {
  days?: number;
  fields?: ScheduleField[];
  /** Event types to show: preset groups ("group:tests") and type names; empty = all. */
  types?: string[];
}

function findCalendar(hass?: HomeAssistant): string | undefined {
  const states = Object.values(hass?.states ?? {});
  // Prefer a calendar whose next event carries our JSON line.
  return (
    states.find(
      (state) =>
        state.entity_id.startsWith("calendar.") &&
        String(state.attributes.description ?? "").includes('"librus_apix"'),
    ) ?? states.find((state) => state.entity_id.startsWith("calendar."))
  )?.entity_id;
}

/**
 * Upcoming schedule events of one student (F6): events of the next N days from
 * the calendar entity, sorted by start, the nearest one highlighted; a click
 * opens a pop-up with all details from the JSON line of the description.
 */
export class ScheduleCard extends LibrusCard<ScheduleCardConfig> {
  static override properties = {
    _events: { state: true },
    _error: { state: true },
    _selected: { state: true },
  };

  declare _events?: ScheduleEvent[];
  declare _error?: string;
  declare _selected?: ScheduleEvent;

  private _timer?: ReturnType<typeof setInterval>;
  private _fetching?: Promise<void>;

  static override styles = [
    cardStyles,
    listStyles,
    css`
      .badge {
        flex: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 40px;
        line-height: 1.1;
      }
      .badge .day {
        font-size: var(--ha-font-size-l, 18px);
        font-weight: var(--ha-font-weight-medium, 500);
      }
      .badge .weekday {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        text-transform: uppercase;
      }
      li.next {
        box-shadow: inset 4px 0 0 var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }
      li.next .title {
        font-weight: var(--ha-font-weight-medium, 500);
      }
      .next-label {
        flex: none;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: var(--ha-font-size-xs, 11px);
      }
      .error {
        padding: 0 16px 16px;
        color: var(--error-color, #db4437);
      }
    `,
  ];

  static getConfigElement(): HTMLElement {
    return document.createElement(SCHEDULE_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): ScheduleCardConfig {
    return { type: `custom:${SCHEDULE_CARD}`, entity: findCalendar(hass) ?? "" };
  }

  override setConfig(config: ScheduleCardConfig): void {
    if (!config?.entity) {
      throw new Error("Entity required (the Librus schedule calendar)");
    }
    const days = config.days ?? DEFAULT_DAYS;
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
      throw new Error(`days must be a whole number from 1 to ${MAX_DAYS}`);
    }
    const reload = this._config?.entity !== config.entity || this._config?.days !== config.days;
    super.setConfig(config);
    if (reload) {
      this._events = undefined;
      void this._refresh();
    }
  }

  protected get defaultTitle(): string {
    return this.t("schedule.name");
  }

  protected get defaultIcon(): string {
    return "mdi:calendar-text";
  }

  private get _fields(): Set<ScheduleField> {
    return new Set(this._config?.fields ?? DEFAULT_SCHEDULE_FIELDS);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._timer = setInterval(() => void this._refresh(), REFRESH_MS);
    void this._refresh();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this._timer);
    this._timer = undefined;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    // The calendar entity changed (an event started or ended, new data): read again.
    const old = changed.get("hass") as HomeAssistant | undefined;
    const entity = this._config?.entity;
    if (entity && old && old.states[entity] !== this.hass?.states[entity]) {
      void this._refresh();
    }
    if (!old && changed.has("hass") && this._events === undefined) {
      void this._refresh();
    }
  }

  /** Read the events of the timeframe (one request at a time). */
  private async _refresh(): Promise<void> {
    if (!this.hass || !this._config?.entity || !this.isConnected || this._fetching) {
      return this._fetching;
    }
    const now = new Date();
    const until = new Date(now.getTime() + (this._config.days ?? DEFAULT_DAYS) * DAY_MS);
    this._fetching = fetchEvents(this.hass, this._config.entity, now, until)
      .then((events) => {
        this._events = events;
        this._error = undefined;
      })
      .catch((error: unknown) => {
        this._error = errorText(error);
      })
      .finally(() => {
        this._fetching = undefined;
      });
    return this._fetching;
  }

  /** Events of the timeframe that the type filter selects (undefined while loading). */
  private get _shown(): ScheduleEvent[] | undefined {
    return this._events && filterByType(this._events, this._config?.types);
  }

  override getCardSize(): number {
    return 1 + Math.max(1, this._shown?.length ?? 1);
  }

  private _open(event: ScheduleEvent): void {
    this._selected = event;
    void this.updateComplete.then(() => this.renderRoot.querySelector<LibrusDialog>(DIALOG)?.show());
  }

  /** "09:50–10:35", "lekcja 3" or "Cały dzień". */
  private _when(event: ScheduleEvent): string {
    if (event.allDay) {
      return this.t("schedule.all_day");
    }
    return `${formatTime(this.hass, event.start)}–${formatTime(this.hass, event.end)}`;
  }

  private _renderRow(event: ScheduleEvent, next: boolean): TemplateResult {
    const fields = this._fields;
    const lesson = event.fields?.lesson;
    const meta = [
      fields.has("time") ? this._when(event) : "",
      fields.has("time") && lesson ? this.t("schedule.lesson_n", { n: lesson }) : "",
      fields.has("teacher") ? (event.fields?.teacher ?? "") : "",
      fields.has("description") ? (event.fields?.description ?? "") : "",
    ].filter(Boolean);
    const parts = dayParts(this.hass, event.date ?? event.start);
    return html`
      <li class=${next ? "next" : ""}>
        <button class="row" @click=${() => this._open(event)}>
          ${fields.has("date")
            ? html`<span class="badge" aria-label=${event.date ? formatDate(this.hass, event.date) : formatDateTime(this.hass, event.start.toISOString())}>
                <span class="day">${parts.day}</span>
                <span class="weekday">${parts.weekday}</span>
              </span>`
            : nothing}
          <span class="text">
            <div class="title">${event.summary}</div>
            ${meta.length ? html`<div class="meta">${meta.join(" · ")}</div>` : nothing}
          </span>
          ${next ? html`<span class="next-label">${this.t("schedule.next")}</span>` : nothing}
        </button>
      </li>
    `;
  }

  /** All details: the fields of the JSON line, then the other Librus fields. */
  private _renderDetails(event: ScheduleEvent): TemplateResult {
    const f = event.fields;
    const date = event.date ? formatDate(this.hass, event.date) : formatDate(this.hass, event.start.toISOString());
    const rows: [string, string | undefined][] = [
      [this.t("schedule.type"), f?.type],
      [this.t("schedule.subject"), f?.subject],
      [this.t("schedule.date"), date],
      [this.t("schedule.time"), this._when(event)],
      [this.t("schedule.lesson"), f?.lesson ? String(f.lesson) : undefined],
      [this.t("schedule.teacher"), f?.teacher],
      [this.t("schedule.added"), f?.date_added],
    ];
    // Librus fields not shown above (school-specific labels), as Librus writes them.
    const shown = new Set(["Data", "Nr lekcji", "Rodzaj", "Przedmiot", "Nauczyciel", "Opis", "Data dodania", "Godzina"]);
    const other = Object.entries(f?.details ?? {}).filter(([key, value]) => value && !shown.has(key));
    const description = f ? f.description : event.text;
    return html`
      <dl>
        ${rows
          .filter(([, value]) => value)
          .map(([label, value]) => html`<dt>${label}</dt><dd>${value}</dd>`)}
        ${other.map(([label, value]) => html`<dt>${label}</dt><dd>${value}</dd>`)}
      </dl>
      ${description ? html`<div class="body"><div class="content">${description}</div></div>` : nothing}
    `;
  }

  protected override render() {
    if (!this._config || !this.hass) {
      return nothing;
    }
    if (!this.stateObj) {
      return this.renderMissingEntity();
    }
    const events = this._shown;
    const now = Date.now();
    const next = events?.find((event) => event.end.getTime() > now);
    let content: TemplateResult;
    if (this._error && !events) {
      content = html`<div class="error">${this.t("common.error", { error: this._error })}</div>`;
    } else if (!events) {
      content = html`<div class="empty">${this.t("common.loading")}</div>`;
    } else if (!events.length) {
      const key = this._events?.length ? "schedule.empty_filtered" : "schedule.empty";
      content = html`<div class="empty">${this.t(key, { days: this._config.days ?? DEFAULT_DAYS })}</div>`;
    } else {
      content = html`<ul class="items">${events.map((event) => this._renderRow(event, event === next))}</ul>`;
    }
    return html`
      <ha-card>
        ${this.renderHeader()} ${content}
      </ha-card>
      <librus-apix-dialog
        .heading=${this._selected?.summary ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => (this._selected = undefined)}
      >
        ${this._selected ? this._renderDetails(this._selected) : nothing}
      </librus-apix-dialog>
    `;
  }
}

export class ScheduleCardEditor extends LibrusCardEditor<ScheduleCardConfig> {
  static override properties = {
    _found: { state: true },
  };

  /** Event types found in the calendar for the next MAX_DAYS days. */
  declare _found?: string[];

  private _foundFor?: string;

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    const entity = this._config?.entity;
    if (this.hass && entity && entity !== this._foundFor) {
      this._foundFor = entity;
      const now = new Date();
      fetchEvents(this.hass, entity, now, new Date(now.getTime() + MAX_DAYS * DAY_MS))
        .then((events) => {
          if (this._foundFor === entity) {
            this._found = typesIn(events);
          }
        })
        // Without data the filter still offers the groups and the configured types.
        .catch(() => undefined);
    }
  }

  /** Options of the type filter: groups first, then the types in the data and the config. */
  private _typeOptions(): { value: string; label: string }[] {
    const groups = TYPE_GROUPS.map((group) => ({
      value: `${GROUP_PREFIX}${group.id}`,
      label: `${localize(this.hass, `schedule.group_${group.id}`)} (${group.types.join(", ")})`,
    }));
    const types = [...(this._found ?? [])];
    for (const item of this._config?.types ?? []) {
      if (!item.startsWith(GROUP_PREFIX) && !types.includes(item)) {
        types.push(item);
      }
    }
    return [...groups, ...types.map((type) => ({ value: type, label: type }))];
  }

  protected get schema(): FormField[] {
    return [
      ...baseFields("calendar"),
      { name: "days", selector: { number: { min: 1, max: MAX_DAYS, mode: "box", unit_of_measurement: "d" } } },
      fieldsField(this.hass, "schedule", SCHEDULE_FIELDS),
      {
        name: "types",
        selector: { select: { multiple: true, custom_value: true, options: this._typeOptions() } },
      },
    ];
  }

  override setConfig(config: ScheduleCardConfig): void {
    // Show the defaults in the form (the first change writes them into the config).
    super.setConfig({ days: DEFAULT_DAYS, fields: [...DEFAULT_SCHEDULE_FIELDS], ...config });
  }
}
