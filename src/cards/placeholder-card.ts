import { css, html } from "lit";

import { LibrusCard, type BaseCardConfig } from "../common/base-card";
import { DIALOG, type LibrusDialog } from "../common/dialog";
import { LibrusCardEditor, type FormField } from "../common/editor";
import { cardStyles } from "../common/styles";
import { VERSION } from "../version";

export const PLACEHOLDER_CARD = "librus-apix-placeholder-card";
export const PLACEHOLDER_EDITOR = "librus-apix-placeholder-card-editor";

/**
 * Shows that the bundle loaded and previews the shared parts (header, texts,
 * pop-up). Removed when the first real card lands (T-027).
 */
export class PlaceholderCard extends LibrusCard<BaseCardConfig> {
  static override styles = [
    cardStyles,
    css`
      .version {
        color: var(--secondary-text-color);
      }
    `,
  ];

  static getConfigElement(): HTMLElement {
    return document.createElement(PLACEHOLDER_EDITOR);
  }

  static getStubConfig(): BaseCardConfig {
    return { type: `custom:${PLACEHOLDER_CARD}` };
  }

  protected get defaultTitle(): string {
    return this.t("placeholder.name");
  }

  protected get defaultIcon(): string {
    return "mdi:school";
  }

  override getCardSize(): number {
    return 2;
  }

  private _openDialog(): void {
    this.renderRoot.querySelector<LibrusDialog>(DIALOG)?.show();
  }

  protected override render() {
    if (!this._config) {
      return html``;
    }
    return html`
      <ha-card>
        ${this.renderHeader()}
        <div class="card-content">
          <div class="content">Librus APIX Cards <span class="version">${VERSION}</span></div>
          <button class="link" @click=${this._openDialog}>${this.t("placeholder.open_dialog")}</button>
        </div>
      </ha-card>
      <librus-apix-dialog .heading=${this.t("placeholder.dialog_title")} .closeLabel=${this.t("common.close")}>
        <p>${this.t("placeholder.dialog_text")}</p>
      </librus-apix-dialog>
    `;
  }
}

export class PlaceholderCardEditor extends LibrusCardEditor<BaseCardConfig> {
  protected get schema(): FormField[] {
    return [
      {
        name: "",
        type: "grid",
        schema: [
          { name: "title", selector: { text: {} } },
          { name: "icon", selector: { icon: {} } },
        ],
      },
    ];
  }
}
