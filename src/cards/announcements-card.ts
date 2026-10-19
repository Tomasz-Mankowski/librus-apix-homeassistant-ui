import { html, nothing, type TemplateResult } from "lit";

import { LibrusCard, type BaseCardConfig } from "../common/base-card";
import { DIALOG, type LibrusDialog } from "../common/dialog";
import { LibrusCardEditor, baseFields, type FormField } from "../common/editor";
import { formatDate } from "../common/format";
import { DEFAULT_COUNT, checkCount, countField, fieldsField, listStyles } from "../common/list";
import { cardStyles } from "../common/styles";
import type { HomeAssistant } from "../types";

export const ANNOUNCEMENTS_CARD = "librus-announcements-card";
export const ANNOUNCEMENTS_EDITOR = "librus-announcements-card-editor";

/** Elements of a list row that can be switched on and off (the title is always shown). */
export const ANNOUNCEMENT_FIELDS = ["author", "date", "preview"] as const;
export type AnnouncementField = (typeof ANNOUNCEMENT_FIELDS)[number];
export const DEFAULT_ANNOUNCEMENT_FIELDS: AnnouncementField[] = ["author", "date"];

export interface AnnouncementsCardConfig extends BaseCardConfig {
  count?: number;
  fields?: AnnouncementField[];
}

/** One announcement of the sensor's `announcements` attribute (integration, D-068). */
export interface Announcement {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
}

/** The announcements of a Librus announcements sensor, newest first; [] if none. */
export function announcementsOf(attributes: Record<string, unknown> | undefined): Announcement[] {
  const items = attributes?.announcements;
  return Array.isArray(items) ? (items as Announcement[]) : [];
}

function findAnnouncementsEntity(hass?: HomeAssistant): string | undefined {
  return Object.values(hass?.states ?? {}).find(
    (state) => state.entity_id.startsWith("sensor.") && Array.isArray(state.attributes.announcements),
  )?.entity_id;
}

/**
 * Announcements of one student's school (F10): the last N announcements; a click
 * opens a pop-up with the full text.
 */
export class AnnouncementsCard extends LibrusCard<AnnouncementsCardConfig> {
  static override properties = {
    _selected: { state: true },
  };

  declare _selected?: Announcement;

  static override styles = [cardStyles, listStyles];

  static getConfigElement(): HTMLElement {
    return document.createElement(ANNOUNCEMENTS_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): AnnouncementsCardConfig {
    return { type: `custom:${ANNOUNCEMENTS_CARD}`, entity: findAnnouncementsEntity(hass) ?? "" };
  }

  override setConfig(config: AnnouncementsCardConfig): void {
    if (!config?.entity) {
      throw new Error("Entity required (the Librus announcements sensor)");
    }
    checkCount(config.count);
    super.setConfig(config);
  }

  protected get defaultTitle(): string {
    return this.t("announcements.name");
  }

  protected get defaultIcon(): string {
    return "mdi:bullhorn-outline";
  }

  private get _fields(): Set<AnnouncementField> {
    return new Set(this._config?.fields ?? DEFAULT_ANNOUNCEMENT_FIELDS);
  }

  private get _items(): Announcement[] {
    return announcementsOf(this.stateObj?.attributes).slice(0, this._config?.count ?? DEFAULT_COUNT);
  }

  override getCardSize(): number {
    return 1 + Math.max(1, this._items.length);
  }

  private _open(item: Announcement): void {
    this._selected = item;
    void this.updateComplete.then(() => this.renderRoot.querySelector<LibrusDialog>(DIALOG)?.show());
  }

  private _renderRow(item: Announcement): TemplateResult {
    const fields = this._fields;
    const meta = [
      fields.has("author") ? item.author : "",
      fields.has("date") ? formatDate(this.hass, item.date) : "",
    ].filter(Boolean);
    return html`
      <li>
        <button class="row" @click=${() => this._open(item)}>
          <span class="text">
            <div class="title">${item.title}</div>
            ${meta.length ? html`<div class="meta">${meta.join(" · ")}</div>` : nothing}
            ${fields.has("preview") && item.content
              ? html`<div class="meta preview">${item.content.split("\n")[0]}</div>`
              : nothing}
          </span>
        </button>
      </li>
    `;
  }

  private _renderDetails(item: Announcement): TemplateResult {
    return html`
      <dl>
        <dt>${this.t("announcements.author")}</dt>
        <dd>${item.author}</dd>
        <dt>${this.t("announcements.date")}</dt>
        <dd>${formatDate(this.hass, item.date)}</dd>
      </dl>
      <div class="body"><div class="content">${item.content}</div></div>
    `;
  }

  protected override render() {
    if (!this._config || !this.hass) {
      return nothing;
    }
    if (!this.stateObj) {
      return this.renderMissingEntity();
    }
    const items = this._items;
    // The pop-up follows the sensor; an announcement that left the list stays shown.
    const selected = this._selected
      ? (announcementsOf(this.stateObj.attributes).find((a) => a.id === this._selected?.id) ?? this._selected)
      : undefined;
    return html`
      <ha-card>
        ${this.renderHeader()}
        ${items.length
          ? html`<ul class="items">${items.map((item) => this._renderRow(item))}</ul>`
          : html`<div class="empty">${this.t("announcements.empty")}</div>`}
      </ha-card>
      <librus-apix-dialog
        .heading=${selected?.title ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => (this._selected = undefined)}
      >
        ${selected ? this._renderDetails(selected) : nothing}
      </librus-apix-dialog>
    `;
  }
}

export class AnnouncementsCardEditor extends LibrusCardEditor<AnnouncementsCardConfig> {
  protected get schema(): FormField[] {
    return [
      ...baseFields("sensor"),
      countField(),
      fieldsField(this.hass, "announcements", ANNOUNCEMENT_FIELDS),
    ];
  }

  override setConfig(config: AnnouncementsCardConfig): void {
    // Show the defaults in the form (the first change writes them into the config).
    super.setConfig({ count: DEFAULT_COUNT, fields: [...DEFAULT_ANNOUNCEMENT_FIELDS], ...config });
  }
}
