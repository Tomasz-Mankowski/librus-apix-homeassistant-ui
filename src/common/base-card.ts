import {
  LitElement,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from "lit";

import { localize } from "./localize";
import { cardStyles } from "./styles";
import type { HassEntity, HomeAssistant, LovelaceCardConfig } from "../types";

/** Options every Librus card has. An empty title hides the header. */
export interface BaseCardConfig extends LovelaceCardConfig {
  entity?: string;
  title?: string;
  icon?: string;
}

/**
 * Base of the Librus cards: config, texts in the HA language, the standard card
 * header with title and icon, a warning for a missing entity and grid sizing for
 * sections views. Renders again only when its own entity or the language changes
 * (N1: Home Assistant sets `hass` on every state change of every entity).
 */
export abstract class LibrusCard<C extends BaseCardConfig = BaseCardConfig> extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: C;

  static override styles: CSSResultGroup = cardStyles;

  /** Default title and icon of the card (used when the config has none). */
  protected abstract get defaultTitle(): string;
  protected abstract get defaultIcon(): string;

  setConfig(config: C): void {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  getCardSize(): number {
    return 3;
  }

  getGridOptions(): Record<string, number | string> {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  protected t(key: string, params?: Record<string, string | number>): string {
    return localize(this.hass, key, params);
  }

  protected get stateObj(): HassEntity | undefined {
    const entity = this._config?.entity;
    return entity ? this.hass?.states[entity] : undefined;
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (changed.size !== 1 || !changed.has("hass")) {
      return true;
    }
    const old = changed.get("hass") as HomeAssistant | undefined;
    if (!old || !this.hass) {
      return true;
    }
    const entity = this._config?.entity;
    return (
      old.locale?.language !== this.hass.locale?.language ||
      old.themes?.darkMode !== this.hass.themes?.darkMode ||
      (entity !== undefined && old.states[entity] !== this.hass.states[entity])
    );
  }

  /** The card header: config title (or the default) with the icon; none for "". */
  protected renderHeader(): TemplateResult | typeof nothing {
    const title = this._config?.title ?? this.defaultTitle;
    if (!title) {
      return nothing;
    }
    const icon = this._config?.icon ?? this.defaultIcon;
    return html`
      <h1 class="card-header">
        ${icon ? html`<ha-icon .icon=${icon}></ha-icon>` : nothing}
        <span class="name">${title}</span>
      </h1>
    `;
  }

  /** Warning instead of the content when the configured entity does not exist. */
  protected renderMissingEntity(): TemplateResult {
    return html`
      <ha-card>
        ${this.renderHeader()}
        <div class="warning">${this.t("common.entity_not_found", { entity: this._config?.entity ?? "" })}</div>
      </ha-card>
    `;
  }
}
