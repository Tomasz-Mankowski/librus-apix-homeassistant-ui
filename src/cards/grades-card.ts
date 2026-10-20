import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import { LibrusCard, type BaseCardConfig } from "../common/base-card";
import { levelColor, type LevelOptions } from "../common/colors";
import {
  LibrusCardEditor,
  deviceField,
  headerFields,
  subjectsField,
  type FormField,
} from "../common/editor";
import { formatAverage, formatDate } from "../common/format";
import { listStyles } from "../common/list";
import {
  SUBJECT_GRADES,
  deviceEntities,
  gpaEntity,
  studentDevices,
  subjects,
  type Subject,
} from "../common/student";
import { cardStyles } from "../common/styles";
import type { HassEntity, HomeAssistant } from "../types";

export const GRADES_CARD = "librus-grades-card";
export const GRADES_EDITOR = "librus-grades-card-editor";

export interface GradesCardConfig extends BaseCardConfig, LevelOptions {
  /** The student: a device of the Librus integration (D-115). */
  device?: string;
  /** Subject names that are not shown. */
  exclude?: string[];
  /** Show the subject average on each row; default: on. */
  show_average?: boolean;
  /** Show the student's GPA under the header; default: on. */
  show_gpa?: boolean;
}

/** One grade of a subject sensor's `grades` attribute (integration, D-071). */
export interface Grade {
  id: string;
  grade: string;
  value: number | null;
  category: string;
  date: string;
  weight: number | null;
  counts: boolean;
  teacher: string;
  comment: string;
}

/** Number of a sensor state ("3.35"), or null (unknown, unavailable). */
export function numericState(state: HassEntity | undefined): number | null {
  const value = state ? Number.parseFloat(state.state) : Number.NaN;
  return Number.isFinite(value) ? value : null;
}

/** Current semester (1 or 2) of a subject or GPA sensor. */
export function semesterOf(state: HassEntity | undefined): number {
  return state?.attributes.semester === 2 ? 2 : 1;
}

/** Grades of the current semester, oldest first (Librus lists corrections last). */
export function currentGrades(state: HassEntity | undefined): Grade[] {
  const grades = state?.attributes.grades as Record<string, Grade[] | undefined> | undefined;
  const list = grades?.[`semester_${semesterOf(state)}`];
  if (!Array.isArray(list)) {
    return [];
  }
  return [...list].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id, "en", { numeric: true }));
}

/**
 * Grades of one student (F1): a row per subject with the grades of the current
 * semester and, optionally, the subject average; the student's GPA under the
 * header. Averages can be coloured by three levels (lower bounds, D-116).
 */
export class GradesCard extends LibrusCard<GradesCardConfig> {
  static override styles = [
    cardStyles,
    listStyles,
    css`
      .gpa {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 0 16px 12px;
        color: var(--secondary-text-color);
      }
      .gpa .value {
        color: var(--librus-level-color, var(--primary-text-color));
        font-size: var(--ha-font-size-l, 16px);
        font-weight: var(--ha-font-weight-bold, 700);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
      }
      li.level {
        box-shadow: inset 4px 0 0 var(--librus-level-color);
        background: color-mix(in srgb, var(--librus-level-color) 10%, transparent);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
      }
      .chip {
        min-width: 1.5em;
        padding: 0 6px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        font-size: var(--ha-font-size-s, 12px);
        line-height: 20px;
        text-align: center;
      }
      .chip.not-counted {
        color: var(--secondary-text-color);
        border-style: dashed;
      }
      .average {
        flex: none;
        min-width: 3em;
        text-align: end;
        font-weight: var(--ha-font-weight-bold, 700);
        color: var(--librus-level-color, var(--primary-text-color));
      }
    `,
  ];

  static getConfigElement(): HTMLElement {
    return document.createElement(GRADES_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): GradesCardConfig {
    return { type: `custom:${GRADES_CARD}`, device: studentDevices(hass, SUBJECT_GRADES)[0] ?? "" };
  }

  override setConfig(config: GradesCardConfig): void {
    if (!config?.device) {
      throw new Error("Device required (a Librus student)");
    }
    super.setConfig(config);
  }

  protected get defaultTitle(): string {
    return this.t("grades.name");
  }

  protected get defaultIcon(): string {
    return "mdi:school-outline";
  }

  /** Subjects to show: the student's subject sensors without the excluded ones. */
  protected get shownSubjects(): Subject[] {
    const exclude = new Set(this._config?.exclude ?? []);
    return subjects(this.hass, this._config?.device, SUBJECT_GRADES).filter((s) => !exclude.has(s.name));
  }

  override getCardSize(): number {
    return 1 + Math.max(1, this.shownSubjects.length);
  }

  /** Renders again when the registry, the language or a state of the student changes (N1). */
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

  private _level(average: number | null): string | undefined {
    return this._config ? levelColor(average, this._config) : undefined;
  }

  private _renderGpa(): TemplateResult | typeof nothing {
    const entity = gpaEntity(this.hass, this._config?.device);
    const state = entity ? this.hass?.states[entity] : undefined;
    if (this._config?.show_gpa === false || !state) {
      return nothing;
    }
    const average = numericState(state);
    return html`
      <div class="gpa" style=${styleMap({ "--librus-level-color": this._level(average) })}>
        <span>${this.t("grades.gpa")}</span>
        <span class="value">${formatAverage(this.hass, average) || "–"}</span>
        <span>${this.t("grades.semester", { n: semesterOf(state) })}</span>
      </div>
    `;
  }

  private _gradeTitle(grade: Grade): string {
    const parts = [grade.category, formatDate(this.hass, grade.date)];
    if (grade.weight) {
      parts.push(this.t("grades.weight_n", { n: grade.weight }));
    }
    if (!grade.counts) {
      parts.push(this.t("grades.not_counted"));
    }
    return parts.filter(Boolean).join(" · ");
  }

  protected renderRow(subject: Subject): TemplateResult {
    const state = this.hass?.states[subject.entity_id];
    const average = numericState(state);
    const color = this._level(average);
    const grades = currentGrades(state);
    return html`
      <li class=${classMap({ level: Boolean(color) })} style=${styleMap({ "--librus-level-color": color })}>
        <div class="row">
          <span class="text">
            <div class="title">${subject.name}</div>
            ${grades.length
              ? html`<div class="chips">
                  ${grades.map(
                    (grade) =>
                      html`<span class=${classMap({ chip: true, "not-counted": !grade.counts })} title=${this._gradeTitle(grade)}
                        >${grade.grade}</span
                      >`,
                  )}
                </div>`
              : html`<div class="meta">${this.t("grades.no_grades")}</div>`}
          </span>
          ${this._config?.show_average === false
            ? nothing
            : html`<span class="average">${formatAverage(this.hass, average) || "–"}</span>`}
        </div>
      </li>
    `;
  }

  protected override render() {
    if (!this._config || !this.hass) {
      return nothing;
    }
    if (!deviceEntities(this.hass, this._config.device).length) {
      return html`
        <ha-card>
          ${this.renderHeader()}
          <div class="warning">${this.t("grades.no_student")}</div>
        </ha-card>
      `;
    }
    const shown = this.shownSubjects;
    return html`
      <ha-card>
        ${this.renderHeader()} ${this._renderGpa()}
        ${shown.length
          ? html`<ul class="items">${shown.map((subject) => this.renderRow(subject))}</ul>`
          : html`<div class="empty">${this.t("grades.empty")}</div>`}
      </ha-card>
    `;
  }
}

/** Fields of the GPA levels: lower bound and colour of each level. */
export function levelFields(): FormField {
  const level = { number: { min: 0, max: 6, step: 0.01, mode: "box" } };
  return {
    name: "",
    type: "grid",
    schema: (["bad", "ok", "excellent"] as const).flatMap((name) => [
      { name: `level_${name}`, selector: level },
      { name: `color_${name}`, selector: { ui_color: {} } },
    ]),
  };
}

export class GradesCardEditor extends LibrusCardEditor<GradesCardConfig> {
  protected get schema(): FormField[] {
    const found = subjects(this.hass, this._config?.device, SUBJECT_GRADES).map((s) => s.name);
    return [
      deviceField(),
      headerFields(),
      subjectsField("exclude", found, this._config?.exclude),
      {
        name: "",
        type: "grid",
        schema: [
          { name: "show_average", selector: { boolean: {} } },
          { name: "show_gpa", selector: { boolean: {} } },
        ],
      },
      levelFields(),
    ];
  }

  override setConfig(config: GradesCardConfig): void {
    // Show the defaults in the form (the first change writes them into the config).
    super.setConfig({ show_average: true, show_gpa: true, ...config });
  }
}
