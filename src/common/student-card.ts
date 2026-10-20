import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";

import { LibrusCard, type BaseCardConfig } from "./base-card";
import { DIALOG, type LibrusDialog } from "./dialog";
import { deviceEntities, subjects, type Subject, type SubjectKind } from "./student";
import type { HomeAssistant } from "../types";

/**
 * Grade chips of a list row: one line; more grades scroll sideways (CR-006). The
 * chips come newest first in the DOM and the strip is reversed, so they read
 * oldest to newest and a long strip opens at its newest end (no script needed).
 */
export const chipStyles = css`
  .chips {
    display: flex;
    flex-direction: row-reverse;
    gap: 4px;
    margin-top: 4px;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  /* A short strip starts at the left; a long one overflows to the left. */
  .chips > :first-child {
    margin-right: auto;
  }
  .chip {
    flex: none;
    display: inline-block;
    min-width: 1.5em;
    padding: 0 6px;
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    font-size: var(--ha-font-size-s, 12px);
    line-height: 20px;
    text-align: center;
  }
`;

/** Options of the cards that show one student's subjects (D-115). */
export interface StudentCardConfig extends BaseCardConfig {
  /** The student: a device of the Librus integration. */
  device?: string;
  /** Subject names that are not shown. */
  exclude?: string[];
}

/**
 * Base of the grades cards: a student (device) instead of one entity, the
 * student's subjects without the excluded ones, a pop-up for one subject, and a
 * render only when the registry, the language, dark mode or a state of the
 * student changes (N1).
 */
export abstract class StudentCard<C extends StudentCardConfig> extends LibrusCard<C> {
  static override properties = {
    _selected: { state: true },
  };

  declare _selected?: Subject;

  /** Which subject sensors the card shows. */
  protected abstract get subjectKind(): SubjectKind;

  override setConfig(config: C): void {
    if (!config?.device) {
      throw new Error("Device required (a Librus student)");
    }
    super.setConfig(config);
  }

  /** The student's subjects without the excluded ones, sorted by name. */
  protected get shownSubjects(): Subject[] {
    const exclude = new Set(this._config?.exclude ?? []);
    return subjects(this.hass, this._config?.device, this.subjectKind).filter((s) => !exclude.has(s.name));
  }

  /** The device has Librus entities. */
  protected get hasStudent(): boolean {
    return deviceEntities(this.hass, this._config?.device).length > 0;
  }

  override getCardSize(): number {
    return 1 + Math.max(1, this.shownSubjects.length);
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (changed.size !== 1 || !changed.has("hass")) {
      return true;
    }
    const old = changed.get("hass") as HomeAssistant | undefined;
    if (!old || !this.hass) {
      return true;
    }
    if (
      old.entities !== this.hass.entities ||
      old.locale?.language !== this.hass.locale?.language ||
      old.themes?.darkMode !== this.hass.themes?.darkMode
    ) {
      return true;
    }
    return deviceEntities(this.hass, this._config?.device).some(
      (entry) => old.states[entry.entity_id] !== this.hass?.states[entry.entity_id],
    );
  }

  /** Open the pop-up of a subject. */
  protected openSubject(subject: Subject): void {
    this._selected = subject;
    void this.updateComplete.then(() => this.renderRoot.querySelector<LibrusDialog>(DIALOG)?.show());
  }

  /** The card for a device without Librus entities. */
  protected renderNoStudent(): TemplateResult {
    return html`
      <ha-card>
        ${this.renderHeader()}
        <div class="warning">${this.t("common.no_student")}</div>
      </ha-card>
    `;
  }

  /** The pop-up of the selected subject. */
  protected renderDialog(details: (subject: Subject) => TemplateResult): TemplateResult {
    return html`
      <librus-apix-dialog
        .heading=${this._selected?.name ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => (this._selected = undefined)}
      >
        ${this._selected ? details(this._selected) : nothing}
      </librus-apix-dialog>
    `;
  }
}
