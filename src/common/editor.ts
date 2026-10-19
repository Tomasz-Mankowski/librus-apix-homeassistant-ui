import { LitElement, html, nothing, type PropertyDeclarations } from "lit";

import { localize } from "./localize";
import type { HomeAssistant, LovelaceCardConfig } from "../types";

/** One field of an `ha-form` schema (the parts the editors use). */
export interface FormField {
  name: string;
  selector?: Record<string, unknown>;
  required?: boolean;
  type?: "grid" | "expandable";
  schema?: FormField[];
  title?: string;
  flatten?: boolean;
}

/**
 * Base of the visual card editors (D-004): the HA form element `ha-form` with the
 * schema of the card; labels come from "editor.<field name>". Every change fires
 * "config-changed" with the whole new config, as Lovelace expects.
 */
export abstract class LibrusCardEditor<C extends LovelaceCardConfig = LovelaceCardConfig> extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: C;

  protected abstract get schema(): FormField[];

  setConfig(config: C): void {
    this._config = config;
  }

  private _label = (field: FormField): string =>
    field.name ? localize(this.hass, `editor.${field.name}`) : "";

  private _valueChanged(event: CustomEvent<{ value: C }>): void {
    event.stopPropagation();
    const config = { ...event.detail.value };
    // Empty optional fields are removed, so the YAML stays short.
    for (const [key, value] of Object.entries(config)) {
      if (value === "" || value === undefined || value === null) {
        delete (config as Record<string, unknown>)[key];
      }
    }
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  protected override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this.schema}
        .computeLabel=${this._label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

/** Fields every card editor starts with. */
export function baseFields(entityDomain: string, entityIntegration = "librus_apix"): FormField[] {
  return [
    {
      name: "entity",
      required: true,
      selector: { entity: { filter: [{ domain: entityDomain, integration: entityIntegration }] } },
    },
    {
      name: "",
      type: "grid",
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "icon_color", selector: { ui_color: {} } },
      ],
    },
  ];
}
