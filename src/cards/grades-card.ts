import { css, html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import { levelColor, type LevelOptions } from "../common/colors";
import { LibrusCardEditor, studentFields, type FormField } from "../common/editor";
import { formatAverage, formatDate } from "../common/format";
import { listStyles } from "../common/list";
import { SUBJECT_GRADES, gpaEntity, studentDevices, type Subject, type SubjectKind } from "../common/student";
import { StudentCard, type StudentCardConfig } from "../common/student-card";
import { cardStyles } from "../common/styles";
import type { HassEntity, HomeAssistant } from "../types";

export const GRADES_CARD = "librus-grades-card";
export const GRADES_EDITOR = "librus-grades-card-editor";

export interface GradesCardConfig extends StudentCardConfig, LevelOptions {
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
  /** Id of the grade this one corrects (D-125); null for other grades. */
  corrects?: string | null;
}

/** A semester or year grade (final or proposed) of `final_grades`. */
export interface FinalGrade {
  id: string;
  period: string;
  grade: string;
  proposed: boolean;
  category: string;
  date: string;
  teacher: string;
}

/** Periods of the grades and averages attributes. */
export const PERIODS = ["semester_1", "semester_2", "year"] as const;

/** Columns of the grades table in the pop-up. */
const COLUMNS = ["grade", "category", "weight", "date", "teacher", "counts", "comment"] as const;

/** Number of a sensor state ("3.35"), or null (unknown, unavailable). */
export function numericState(state: HassEntity | undefined): number | null {
  const value = state ? Number.parseFloat(state.state) : Number.NaN;
  return Number.isFinite(value) ? value : null;
}

/** Current semester (1 or 2) of a subject or GPA sensor. */
export function semesterOf(state: HassEntity | undefined): number {
  return state?.attributes.semester === 2 ? 2 : 1;
}

/** Grades of a semester ("semester_1"), oldest first (Librus lists corrections last). */
export function gradesOf(state: HassEntity | undefined, period: string): Grade[] {
  const grades = state?.attributes.grades as Record<string, Grade[] | undefined> | undefined;
  const list = grades?.[period];
  if (!Array.isArray(list)) {
    return [];
  }
  return [...list].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id, "en", { numeric: true }));
}

/** Grades of the current semester, oldest first. */
export function currentGrades(state: HassEntity | undefined): Grade[] {
  return gradesOf(state, `semester_${semesterOf(state)}`);
}

/** Ids of the grades that a later grade corrects. */
export function correctedIds(grades: Grade[]): Set<string> {
  return new Set(grades.map((grade) => grade.corrects).filter((id): id is string => Boolean(id)));
}

/** Semester and year grades of a subject sensor. */
export function finalGrades(state: HassEntity | undefined): FinalGrade[] {
  const finals = state?.attributes.final_grades;
  return Array.isArray(finals) ? (finals as FinalGrade[]) : [];
}

/**
 * Grades of one student (F1): a row per subject with the grades of the current
 * semester and, optionally, the subject average; the student's GPA under the
 * header. Averages can be coloured by three levels (lower bounds, D-116). A click
 * on a subject opens a pop-up with all its grades, averages and semester grades.
 */
export class GradesCard extends StudentCard<GradesCardConfig> {
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
        display: inline-block;
        min-width: 1.5em;
        padding: 0 6px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        font-size: var(--ha-font-size-s, 12px);
        line-height: 20px;
        text-align: center;
      }
      .chip.not-counted,
      .chip.proposed {
        color: var(--secondary-text-color);
        border-style: dashed;
      }
      .chip.corrected {
        color: var(--secondary-text-color);
        text-decoration: line-through;
      }
      h3 {
        margin: 16px 0 8px;
        font-size: var(--ha-font-size-m, 14px);
        font-weight: var(--ha-font-weight-medium, 500);
      }
      table.grades {
        width: 100%;
        border-collapse: collapse;
      }
      table.grades th {
        color: var(--secondary-text-color);
        font-weight: var(--ha-font-weight-normal, 400);
        text-align: start;
      }
      table.grades th,
      table.grades td {
        padding: 4px 8px 4px 0;
        border-bottom: 1px solid var(--divider-color);
        vertical-align: top;
      }
      .note {
        display: block;
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
      }
      tr.correction .note {
        color: var(--primary-color);
      }
      /* Phones (the pop-up is full screen): one block per grade, labels in front. */
      @media (max-width: 600px) {
        table.grades thead {
          display: none;
        }
        table.grades tr {
          display: block;
          padding: 8px 0;
          border-bottom: 1px solid var(--divider-color);
        }
        table.grades td {
          display: flex;
          gap: 12px;
          padding: 2px 0;
          border: none;
        }
        table.grades td::before {
          content: attr(data-label);
          flex: 0 0 7.5em;
          color: var(--secondary-text-color);
        }
        table.grades td.blank {
          display: none;
        }
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

  protected get subjectKind(): SubjectKind {
    return SUBJECT_GRADES;
  }

  protected get defaultTitle(): string {
    return this.t("grades.name");
  }

  protected get defaultIcon(): string {
    return "mdi:school-outline";
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

  private _gradeTitle(grade: Grade, corrected = false): string {
    const parts = [grade.category, formatDate(this.hass, grade.date)];
    if (grade.weight) {
      parts.push(this.t("grades.weight_n", { n: grade.weight }));
    }
    if (!grade.counts) {
      parts.push(this.t("grades.not_counted"));
    }
    if (corrected) {
      parts.push(this.t("grades.corrected"));
    }
    return parts.filter(Boolean).join(" · ");
  }

  private _chip(grade: Grade, corrected: boolean): TemplateResult {
    return html`<span
      class=${classMap({ chip: true, "not-counted": !grade.counts, corrected })}
      title=${this._gradeTitle(grade, corrected)}
      >${grade.grade}</span
    >`;
  }

  protected renderRow(subject: Subject): TemplateResult {
    const state = this.hass?.states[subject.entity_id];
    const average = numericState(state);
    const color = this._level(average);
    const grades = currentGrades(state);
    const corrected = correctedIds(grades);
    return html`
      <li class=${classMap({ level: Boolean(color) })} style=${styleMap({ "--librus-level-color": color })}>
        <button class="row" @click=${() => this.openSubject(subject)}>
          <span class="text">
            <div class="title">${subject.name}</div>
            ${grades.length
              ? html`<div class="chips">${grades.map((grade) => this._chip(grade, corrected.has(grade.id)))}</div>`
              : html`<div class="meta">${this.t("grades.no_grades")}</div>`}
          </span>
          ${this._config?.show_average === false
            ? nothing
            : html`<span class="average">${formatAverage(this.hass, average) || "–"}</span>`}
        </button>
      </li>
    `;
  }

  /** Averages of both semesters and the year, with their source. */
  private _renderAverages(state: HassEntity): TemplateResult {
    const averages = (state.attributes.averages ?? {}) as Record<string, number | null>;
    const source = state.attributes.average_source;
    return html`
      <dl>
        ${PERIODS.map(
          (period) => html`<dt>${this.t(`grades.period_${period}`)}</dt>
            <dd>${formatAverage(this.hass, averages[period]) || "–"}</dd>`,
        )}
        ${source === "librus" || source === "calculated"
          ? html`<dt>${this.t("grades.source")}</dt>
              <dd>${this.t(`grades.source_${source}`)}</dd>`
          : nothing}
      </dl>
    `;
  }

  /** Table of the grades of one semester; corrections and corrected grades marked. */
  private _renderTable(grades: Grade[]): TemplateResult {
    if (!grades.length) {
      return html`<div class="empty">${this.t("grades.no_grades")}</div>`;
    }
    const corrected = correctedIds(grades);
    const byId = new Map(grades.map((grade) => [grade.id, grade]));
    const label = (column: string): string => this.t(`grades.col_${column}`);
    return html`
      <table class="grades">
        <thead>
          <tr>
            ${COLUMNS.map((column) => html`<th>${label(column)}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${grades.map((grade) => {
            const original = grade.corrects ? byId.get(grade.corrects) : undefined;
            const isCorrected = corrected.has(grade.id);
            let note: string | undefined;
            if (grade.corrects) {
              note = original
                ? this.t("grades.correction_of", { grade: original.grade })
                : this.t("grades.correction");
            } else if (isCorrected) {
              note = this.t("grades.corrected");
            }
            return html`<tr class=${classMap({ correction: Boolean(grade.corrects), corrected: isCorrected })}>
              <td data-label=${label("grade")}>
                <span>${this._chip(grade, isCorrected)} ${note ? html`<span class="note">${note}</span>` : nothing}</span>
              </td>
              <td data-label=${label("category")}>${grade.category}</td>
              <td data-label=${label("weight")}>${grade.weight ?? "–"}</td>
              <td data-label=${label("date")}>${formatDate(this.hass, grade.date)}</td>
              <td data-label=${label("teacher")}>${grade.teacher}</td>
              <td data-label=${label("counts")}>${this.t(grade.counts ? "common.yes" : "common.no")}</td>
              <td data-label=${label("comment")} class=${grade.comment ? "" : "blank"}>${grade.comment}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    `;
  }

  /** Semester and year grades (final and proposed). */
  private _renderFinals(finals: FinalGrade[]): TemplateResult | typeof nothing {
    if (!finals.length) {
      return nothing;
    }
    return html`
      <h3>${this.t("grades.finals")}</h3>
      <dl>
        ${finals.map(
          (final) => html`<dt>${this.t(`grades.period_${final.period}`)}</dt>
            <dd>
              <span class=${classMap({ chip: true, proposed: final.proposed })}>${final.grade}</span>
              ${final.category} · ${formatDate(this.hass, final.date)}${final.teacher ? ` · ${final.teacher}` : ""}
            </dd>`,
        )}
      </dl>
    `;
  }

  /** Pop-up content: averages, the grades of both semesters, the semester and year grades. */
  protected renderDetails(subject: Subject): TemplateResult {
    const state = this.hass?.states[subject.entity_id];
    if (!state) {
      return html`<div class="empty">${this.t("grades.no_grades")}</div>`;
    }
    return html`
      ${this._renderAverages(state)}
      ${(["semester_1", "semester_2"] as const).map(
        (period) => html`<h3>${this.t(`grades.period_${period}`)}</h3>
          ${this._renderTable(gradesOf(state, period))}`,
      )}
      ${this._renderFinals(finalGrades(state))}
    `;
  }

  protected override render() {
    if (!this._config || !this.hass) {
      return nothing;
    }
    if (!this.hasStudent) {
      return this.renderNoStudent();
    }
    const shown = this.shownSubjects;
    return html`
      <ha-card>
        ${this.renderHeader()} ${this._renderGpa()}
        ${shown.length
          ? html`<ul class="items">${shown.map((subject) => this.renderRow(subject))}</ul>`
          : html`<div class="empty">${this.t("grades.empty")}</div>`}
      </ha-card>
      ${this.renderDialog((subject) => this.renderDetails(subject))}
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
    return [
      ...studentFields(this.hass, this._config, SUBJECT_GRADES),
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
