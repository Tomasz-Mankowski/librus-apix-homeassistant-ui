import { css, html, nothing, type TemplateResult } from "lit";

import { LibrusCardEditor, studentFields, type FormField } from "../common/editor";
import { formatDate } from "../common/format";
import { listStyles } from "../common/list";
import { SUBJECT_DESCRIPTIVE, studentDevices, type Subject, type SubjectKind } from "../common/student";
import { StudentCard, type StudentCardConfig } from "../common/student-card";
import { cardStyles } from "../common/styles";
import type { HassEntity, HomeAssistant } from "../types";

export const DESCRIPTIVE_CARD = "librus-descriptive-grades-card";
export const DESCRIPTIVE_EDITOR = "librus-descriptive-grades-card-editor";

export type DescriptiveGradesCardConfig = StudentCardConfig;

/** One grade of a descriptive-grade sensor's `grades` attribute (integration, D-073). */
export interface DescriptiveGrade {
  id: string;
  subject: string;
  semester: number;
  grade: string;
  date: string;
  teacher: string;
  /** The teacher's text. */
  content: string;
  /** All Librus lines of the grade ("Ocena: OP\nData: …\nObszar: …"). */
  description: string;
}

/** Librus lines the pop-up already shows as fields. */
const SHOWN_LINES = new Set(["Ocena", "Przedmiot", "Data", "Nauczyciel", "Treść oceny"]);

/** Descriptive grades of both semesters, oldest first. */
export function descriptiveGrades(state: HassEntity | undefined): DescriptiveGrade[] {
  const grades = state?.attributes.grades as Record<string, DescriptiveGrade[] | undefined> | undefined;
  const all = [...(grades?.semester_1 ?? []), ...(grades?.semester_2 ?? [])].filter(Boolean);
  return all.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

/** Librus lines of a grade that are not shown as fields (for example "Obszar"), as [label, value]. */
export function extraLines(grade: DescriptiveGrade): [string, string][] {
  const lines: [string, string][] = [];
  for (const line of (grade.description ?? "").split("\n")) {
    const separator = line.indexOf(": ");
    if (separator > 0) {
      const label = line.slice(0, separator).trim();
      if (!SHOWN_LINES.has(label)) {
        lines.push([label, line.slice(separator + 2).trim()]);
      }
    }
  }
  return lines;
}

/**
 * Descriptive grades of one student (F2): a row per subject with the grade codes,
 * the latest grade and the number of grades; a click opens the full texts.
 */
export class DescriptiveGradesCard extends StudentCard<DescriptiveGradesCardConfig> {
  static override styles = [
    cardStyles,
    listStyles,
    css`
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
      .count {
        flex: none;
        min-width: 2em;
        text-align: end;
        font-weight: var(--ha-font-weight-bold, 700);
      }
      ul.grades {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      ul.grades > li {
        padding: 12px 0;
      }
      ul.grades > li + li {
        border-top: 1px solid var(--divider-color);
      }
      ul.grades .content {
        margin-top: 8px;
      }
    `,
  ];

  static getConfigElement(): HTMLElement {
    return document.createElement(DESCRIPTIVE_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): DescriptiveGradesCardConfig {
    return { type: `custom:${DESCRIPTIVE_CARD}`, device: studentDevices(hass, SUBJECT_DESCRIPTIVE)[0] ?? "" };
  }

  protected get subjectKind(): SubjectKind {
    return SUBJECT_DESCRIPTIVE;
  }

  protected get defaultTitle(): string {
    return this.t("descriptive.name");
  }

  protected get defaultIcon(): string {
    return "mdi:text-box-outline";
  }

  protected renderRow(subject: Subject): TemplateResult {
    const grades = descriptiveGrades(this.hass?.states[subject.entity_id]);
    const latest = grades[grades.length - 1];
    return html`
      <li>
        <button class="row" @click=${() => this.openSubject(subject)}>
          <span class="text">
            <div class="title">${subject.name}</div>
            ${grades.length
              ? html`<div class="chips">${grades.map((grade) => html`<span class="chip" title=${grade.content}>${grade.grade}</span>`)}</div>`
              : nothing}
            ${latest
              ? html`<div class="meta">
                  ${this.t("descriptive.latest", { date: formatDate(this.hass, latest.date) })} · ${latest.content}
                </div>`
              : html`<div class="meta">${this.t("descriptive.no_grades")}</div>`}
          </span>
          <span class="count" title=${this.t("descriptive.count")}>${grades.length}</span>
        </button>
      </li>
    `;
  }

  /** Pop-up: every descriptive grade of the subject with all its details. */
  protected renderDetails(subject: Subject): TemplateResult {
    const grades = descriptiveGrades(this.hass?.states[subject.entity_id]);
    if (!grades.length) {
      return html`<div class="empty">${this.t("descriptive.no_grades")}</div>`;
    }
    return html`
      <ul class="grades">
        ${[...grades].reverse().map(
          (grade) => html`<li>
            <dl>
              <dt>${this.t("descriptive.grade")}</dt>
              <dd><span class="chip">${grade.grade}</span></dd>
              <dt>${this.t("descriptive.date")}</dt>
              <dd>${formatDate(this.hass, grade.date)}</dd>
              <dt>${this.t("descriptive.teacher")}</dt>
              <dd>${grade.teacher}</dd>
              <dt>${this.t("descriptive.semester")}</dt>
              <dd>${grade.semester}</dd>
              ${extraLines(grade).map(([label, value]) => html`<dt>${label}</dt><dd>${value}</dd>`)}
            </dl>
            <div class="content">${grade.content}</div>
          </li>`,
        )}
      </ul>
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
        ${this.renderHeader()}
        ${shown.length
          ? html`<ul class="items">${shown.map((subject) => this.renderRow(subject))}</ul>`
          : html`<div class="empty">${this.t("descriptive.empty")}</div>`}
      </ha-card>
      ${this.renderDialog((subject) => this.renderDetails(subject))}
    `;
  }
}

export class DescriptiveGradesCardEditor extends LibrusCardEditor<DescriptiveGradesCardConfig> {
  protected get schema(): FormField[] {
    return studentFields(this.hass, this._config, SUBJECT_DESCRIPTIVE);
  }
}
