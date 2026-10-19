// Shared parts of the list cards (messages, announcements): row look, count rule
// and the editor fields for count and visible elements.

import { css } from "lit";

import type { FormField } from "./editor";
import { localize } from "./localize";
import type { HomeAssistant } from "../types";

export const DEFAULT_COUNT = 5;
export const MAX_COUNT = 100;

/** Throws for a count that is not a whole number from 1 to MAX_COUNT. */
export function checkCount(count: number | undefined): void {
  const value = count ?? DEFAULT_COUNT;
  if (!Number.isInteger(value) || value < 1 || value > MAX_COUNT) {
    throw new Error(`count must be a whole number from 1 to ${MAX_COUNT}`);
  }
}

/** Editor field: how many items the list shows. */
export function countField(): FormField {
  return { name: "count", selector: { number: { min: 1, max: MAX_COUNT, mode: "box" } } };
}

/** Editor field: which elements a row shows; labels from "<prefix>.field_<name>". */
export function fieldsField(
  hass: HomeAssistant | undefined,
  prefix: string,
  fields: readonly string[],
): FormField {
  return {
    name: "fields",
    selector: {
      select: {
        multiple: true,
        mode: "list",
        options: fields.map((field) => ({
          value: field,
          label: localize(hass, `${prefix}.field_${field}`),
        })),
      },
    },
  };
}

export const listStyles = css`
  ul.items {
    list-style: none;
    margin: 0;
    padding: 0 0 8px;
  }
  ul.items > li + li {
    border-top: 1px solid var(--divider-color);
  }
  button.row {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: none;
    color: var(--primary-text-color);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  button.row:hover {
    background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.04);
  }
  button.row:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .text {
    flex: 1;
    min-width: 0;
  }
  .title,
  .meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
  }
  .empty {
    padding: 0 16px 16px;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 8px 16px;
    margin: 0;
  }
  dt {
    color: var(--secondary-text-color);
  }
  dd {
    margin: 0;
  }
  .body {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }
  .content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
`;
