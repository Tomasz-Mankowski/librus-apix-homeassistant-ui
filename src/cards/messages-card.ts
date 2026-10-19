import { css, html, nothing, type TemplateResult } from "lit";

import { errorText, getMessageContent, type MessageContent } from "../common/api";
import { LibrusCard, type BaseCardConfig } from "../common/base-card";
import { DIALOG, type LibrusDialog } from "../common/dialog";
import { LibrusCardEditor, baseFields, type FormField } from "../common/editor";
import { formatDateTime } from "../common/format";
import { DEFAULT_COUNT, checkCount, countField, fieldsField, listStyles } from "../common/list";
import { cardStyles } from "../common/styles";
import type { HomeAssistant } from "../types";

export const MESSAGES_CARD = "librus-messages-card";
export const MESSAGES_EDITOR = "librus-messages-card-editor";

/** Elements of a list row that can be switched off (the title is always shown). */
export const MESSAGE_FIELDS = ["author", "date", "attachment", "status"] as const;
export type MessageField = (typeof MESSAGE_FIELDS)[number];

export interface MessagesCardConfig extends BaseCardConfig {
  count?: number;
  fields?: MessageField[];
}

/** One message of the sensor's `messages` attribute (integration, D-065). */
export interface Message {
  id: string;
  author: string;
  title: string;
  date: string;
  unread: boolean;
  has_attachment: boolean;
  content_cached?: boolean;
}

/** The messages of a Librus messages sensor, newest first; [] if it has none. */
export function messagesOf(attributes: Record<string, unknown> | undefined): Message[] {
  const messages = attributes?.messages;
  return Array.isArray(messages) ? (messages as Message[]) : [];
}

/** The first Librus messages sensor (an entity with a `messages` list), for the card picker. */
function findMessagesEntity(hass?: HomeAssistant): string | undefined {
  return Object.values(hass?.states ?? {}).find(
    (state) => state.entity_id.startsWith("sensor.") && Array.isArray(state.attributes.messages),
  )?.entity_id;
}

/**
 * Messages of one student (F8): the last N messages with clear read/unread and
 * attachment marks; a click opens a pop-up with all details. The content is read
 * only on request (reading marks the message read in Librus, F7); a content the
 * integration already has opens directly.
 */
export class MessagesCard extends LibrusCard<MessagesCardConfig> {
  static override properties = {
    _selected: { state: true },
    _loading: { state: true },
    _error: { state: true },
  };

  declare _selected?: Message;
  declare _loading?: string;
  declare _error?: { id: string; text: string };

  // Contents read in this session, by message id: reopening needs no call.
  private _contents = new Map<string, MessageContent>();

  static override styles = [
    cardStyles,
    listStyles,
    css`
      .status {
        flex: none;
        color: var(--secondary-text-color);
      }
      .unread .status {
        color: var(--primary-color);
      }
      .unread .title {
        font-weight: var(--ha-font-weight-bold, 700);
      }
      .attachment {
        flex: none;
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }
      .hint,
      .files {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
      }
      .files {
        list-style: none;
        margin: 12px 0 0;
        padding: 0;
      }
      .files li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 0;
        --mdc-icon-size: 16px;
      }
      .error {
        color: var(--error-color, #db4437);
      }
    `,
  ];

  static getConfigElement(): HTMLElement {
    return document.createElement(MESSAGES_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): MessagesCardConfig {
    return { type: `custom:${MESSAGES_CARD}`, entity: findMessagesEntity(hass) ?? "" };
  }

  override setConfig(config: MessagesCardConfig): void {
    if (!config?.entity) {
      throw new Error("Entity required (the Librus messages sensor)");
    }
    checkCount(config.count);
    super.setConfig(config);
  }

  protected get defaultTitle(): string {
    return this.t("messages.name");
  }

  protected get defaultIcon(): string {
    return "mdi:email-outline";
  }

  private get _fields(): Set<MessageField> {
    return new Set(this._config?.fields ?? MESSAGE_FIELDS);
  }

  private get _messages(): Message[] {
    return messagesOf(this.stateObj?.attributes).slice(0, this._config?.count ?? DEFAULT_COUNT);
  }

  override getCardSize(): number {
    return 1 + Math.max(1, this._messages.length);
  }

  private _open(message: Message): void {
    this._selected = message;
    this._error = undefined;
    void this.updateComplete.then(() => this.renderRoot.querySelector<LibrusDialog>(DIALOG)?.show());
    // A content the integration already keeps costs no Librus request: show it at once.
    if (message.content_cached && !this._contents.has(message.id)) {
      void this._readContent(message);
    }
  }

  private async _readContent(message: Message): Promise<void> {
    if (!this.hass || !this._config?.entity || this._loading === message.id) {
      return;
    }
    this._loading = message.id;
    this._error = undefined;
    try {
      const content = await getMessageContent(this.hass, this._config.entity, message.id);
      this._contents.set(message.id, content);
    } catch (error) {
      this._error = { id: message.id, text: errorText(error) };
    } finally {
      this._loading = undefined;
    }
  }

  private _renderContent(message: Message): TemplateResult {
    const content = this._contents.get(message.id);
    if (content) {
      return html`
        <div class="content">${content.content}</div>
        ${content.attachments.length
          ? html`<ul class="files" aria-label=${this.t("messages.attachments")}>
              ${content.attachments.map(
                (name) => html`<li><ha-icon .icon=${"mdi:paperclip"}></ha-icon><span>${name}</span></li>`,
              )}
            </ul>`
          : nothing}
      `;
    }
    if (this._loading === message.id) {
      return html`<div class="hint">${this.t("common.loading")}</div>`;
    }
    const error = this._error?.id === message.id ? this._error.text : undefined;
    return html`
      ${error ? html`<div class="error">${this.t("messages.cannot_read", { error })}</div>` : nothing}
      <button class="link" @click=${() => this._readContent(message)}>
        ${this.t(error ? "messages.retry" : "messages.read_content")}
      </button>
      ${message.content_cached ? nothing : html`<div class="hint">${this.t("messages.read_hint")}</div>`}
    `;
  }

  private _statusText(message: Message): string {
    return this.t(message.unread ? "messages.unread" : "messages.read");
  }

  private _renderRow(message: Message): TemplateResult {
    const fields = this._fields;
    const meta = [
      fields.has("author") ? message.author : "",
      fields.has("date") ? formatDateTime(this.hass, message.date) : "",
    ].filter(Boolean);
    return html`
      <li class=${message.unread ? "unread" : "read"}>
        <button class="row" @click=${() => this._open(message)}>
          ${fields.has("status")
            ? html`<ha-icon
                class="status"
                .icon=${message.unread ? "mdi:email" : "mdi:email-open-outline"}
                title=${this._statusText(message)}
              ></ha-icon>`
            : nothing}
          <span class="text">
            <div class="title">${message.title}</div>
            ${meta.length ? html`<div class="meta">${meta.join(" · ")}</div>` : nothing}
          </span>
          ${fields.has("attachment") && message.has_attachment
            ? html`<ha-icon class="attachment" .icon=${"mdi:paperclip"} title=${this.t("messages.attachment")}></ha-icon>`
            : nothing}
        </button>
      </li>
    `;
  }

  /** Details of the selected message in the pop-up, then its content. */
  protected renderDetails(message: Message): TemplateResult {
    return html`
      <dl>
        <dt>${this.t("messages.from")}</dt>
        <dd>${message.author}</dd>
        <dt>${this.t("messages.date")}</dt>
        <dd>${formatDateTime(this.hass, message.date)}</dd>
        <dt>${this.t("messages.status")}</dt>
        <dd>${this._statusText(message)}</dd>
        <dt>${this.t("messages.attachments")}</dt>
        <dd>${this.t(message.has_attachment ? "common.yes" : "common.no")}</dd>
      </dl>
      <div class="body">${this._renderContent(message)}</div>
    `;
  }

  protected override render() {
    if (!this._config || !this.hass) {
      return nothing;
    }
    if (!this.stateObj) {
      return this.renderMissingEntity();
    }
    const messages = this._messages;
    // The pop-up follows the sensor (a read content turns the message read).
    const selected = this._selected
      ? (messagesOf(this.stateObj.attributes).find((m) => m.id === this._selected?.id) ?? this._selected)
      : undefined;
    return html`
      <ha-card>
        ${this.renderHeader()}
        ${messages.length
          ? html`<ul class="items">${messages.map((message) => this._renderRow(message))}</ul>`
          : html`<div class="empty">${this.t("messages.empty")}</div>`}
      </ha-card>
      <librus-apix-dialog
        .heading=${selected?.title ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => (this._selected = undefined)}
      >
        ${selected ? this.renderDetails(selected) : nothing}
      </librus-apix-dialog>
    `;
  }
}

export class MessagesCardEditor extends LibrusCardEditor<MessagesCardConfig> {
  protected get schema(): FormField[] {
    return [
      ...baseFields("sensor"),
      countField(),
      fieldsField(this.hass, "messages", MESSAGE_FIELDS),
    ];
  }

  override setConfig(config: MessagesCardConfig): void {
    // Show the defaults in the form (the first change writes them into the config).
    super.setConfig({ count: DEFAULT_COUNT, fields: [...MESSAGE_FIELDS], ...config });
  }
}
