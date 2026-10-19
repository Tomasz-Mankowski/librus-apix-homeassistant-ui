import { LitElement, css, html } from "lit";

export const DIALOG = "librus-apix-dialog";

// Material Design Icons "close" (mdi:close), inline so the dialog needs nothing from HA.
const CLOSE_ICON =
  "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The focused element, also inside shadow roots. */
function deepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/**
 * Pop-up of the cards (D-004, F14): a native modal <dialog>, so it opens in the
 * browser's top layer above the dashboard and is never clipped by a card.
 * Closes on Esc, a click on the backdrop and the close button; Tab stays inside;
 * focus goes back to the element that opened it. Fires "closed" when it closes.
 *
 *   <librus-apix-dialog .heading=${title} .closeLabel=${t("common.close")}>
 *     ...details...
 *   </librus-apix-dialog>
 *   dialog.show();
 */
export class LibrusDialog extends LitElement {
  static override properties = {
    heading: { type: String },
    closeLabel: { attribute: false },
    open: { type: Boolean, reflect: true },
  };

  declare heading: string;
  declare closeLabel: string;
  declare open: boolean;

  private _opener: Element | null = null;

  constructor() {
    super();
    this.heading = "";
    this.closeLabel = "Close";
    this.open = false;
  }

  static override styles = css`
    dialog {
      padding: 0;
      border: none;
      background: transparent;
      max-width: min(560px, calc(100vw - 32px));
      width: 100%;
      max-height: calc(100vh - 64px);
      color: var(--primary-text-color);
    }
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.45);
    }
    .panel {
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 64px);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-dialog-border-radius, var(--ha-card-border-radius, 12px));
      box-shadow: var(--ha-card-box-shadow, 0 8px 24px rgba(0, 0, 0, 0.3));
      overflow: hidden;
    }
    header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 8px 8px 24px;
    }
    h2 {
      flex: 1;
      margin: 0;
      font-size: var(--ha-font-size-xl, 20px);
      font-weight: var(--ha-font-weight-normal, 400);
      line-height: var(--ha-line-height-condensed, 1.2);
    }
    button.close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    button.close:hover {
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
    }
    button.close:focus-visible {
      outline: 2px solid var(--primary-color);
    }
    svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    .content {
      padding: 0 24px 24px;
      overflow-y: auto;
    }
    @media (max-width: 600px) {
      dialog,
      .panel {
        max-width: 100vw;
        max-height: 100vh;
        height: 100%;
        margin: 0;
        border-radius: 0;
      }
    }
  `;

  /** Open the pop-up; remembers the focused element to return to. */
  show(): void {
    this._opener = deepActiveElement();
    this.open = true;
  }

  /** Close the pop-up (no-op when closed). */
  close(): void {
    if (!this.open) {
      return;
    }
    this.open = false;
  }

  private get _dialog(): HTMLDialogElement | null {
    return this.renderRoot?.querySelector("dialog") ?? null;
  }

  /** Focusable elements of the pop-up: its close button, then the slotted details. */
  private _focusables(): HTMLElement[] {
    const own = [...(this.renderRoot.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    const slot = this.renderRoot.querySelector("slot");
    const slotted = (slot?.assignedElements({ flatten: true }) ?? []).flatMap((el) => [
      ...(el.matches(FOCUSABLE) ? [el as HTMLElement] : []),
      ...el.querySelectorAll<HTMLElement>(FOCUSABLE),
    ]);
    return [...own, ...slotted];
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open")) {
      return;
    }
    const dialog = this._dialog;
    if (!dialog) {
      return;
    }
    if (this.open && !dialog.open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      this._focusables()[0]?.focus();
    } else if (!this.open && changed.get("open") === true) {
      if (dialog.open) {
        dialog.close();
      }
      dialog.removeAttribute("open");
      if (this._opener instanceof HTMLElement) {
        this._opener.focus();
      }
      this._opener = null;
      this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
    }
  }

  private _onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const focusables = this._focusables();
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = deepActiveElement();
    if (event.shiftKey && (active === first || !focusables.includes(active as HTMLElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !focusables.includes(active as HTMLElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  private _onClick(event: MouseEvent): void {
    // A click on the backdrop reaches the <dialog> itself; clicks on the panel do not.
    if (event.target === this._dialog) {
      this.close();
    }
  }

  private _onCancel(event: Event): void {
    // Native Esc handling: close through close() so "closed" fires and focus returns.
    event.preventDefault();
    this.close();
  }

  protected override render() {
    return html`
      <dialog
        aria-labelledby="heading"
        @keydown=${this._onKeyDown}
        @click=${this._onClick}
        @cancel=${this._onCancel}
        @close=${this.close}
      >
        <div class="panel">
          <header>
            <h2 id="heading">${this.heading}</h2>
            <button class="close" aria-label=${this.closeLabel} title=${this.closeLabel} @click=${this.close}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${CLOSE_ICON}></path></svg>
            </button>
          </header>
          <div class="content"><slot></slot></div>
        </div>
      </dialog>
    `;
  }
}
