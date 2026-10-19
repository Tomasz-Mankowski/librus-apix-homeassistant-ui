import { LitElement, css, html } from "lit";

import { VERSION } from "../version";
import type { HomeAssistant, LovelaceCardConfig } from "../types";

export const PLACEHOLDER_CARD = "librus-apix-placeholder-card";

// Shows that the bundle loaded (T-025); replaced by the real cards later.
export class PlaceholderCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: LovelaceCardConfig;

  static override styles = css`
    .content {
      padding: 16px;
      color: var(--primary-text-color);
    }
    .version {
      color: var(--secondary-text-color);
    }
  `;

  setConfig(config: LovelaceCardConfig): void {
    this._config = config;
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions(): Record<string, number> {
    return { columns: 6, rows: 1, min_rows: 1 };
  }

  protected override render() {
    if (!this._config) {
      return html``;
    }
    return html`
      <ha-card>
        <div class="content">
          Librus APIX Cards <span class="version">${VERSION}</span>
        </div>
      </ha-card>
    `;
  }
}
