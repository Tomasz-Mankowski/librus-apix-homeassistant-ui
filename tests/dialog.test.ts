import { afterEach, describe, expect, it } from "vitest";

import "../src/index";
import { DIALOG, type LibrusDialog } from "../src/common/dialog";
import { mount } from "./helpers";

async function openDialog(): Promise<{ dialog: LibrusDialog; opener: HTMLButtonElement }> {
  const opener = document.createElement("button");
  opener.textContent = "open";
  document.body.append(opener);
  opener.focus();
  const dialog = await mount<LibrusDialog>(DIALOG, (el) => {
    el.heading = "Details";
    el.closeLabel = "Zamknij";
    el.innerHTML = `<p>Text</p><button id="first">One</button><a id="second" href="#">Two</a>`;
  });
  dialog.show();
  await dialog.updateComplete;
  return { dialog, opener };
}

function native(dialog: LibrusDialog): HTMLDialogElement {
  return dialog.shadowRoot!.querySelector("dialog")!;
}

function closeButton(dialog: LibrusDialog): HTMLButtonElement {
  return dialog.shadowRoot!.querySelector("button.close")!;
}

function deepActive(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function press(dialog: LibrusDialog, key: string, shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true, composed: true });
  native(dialog).dispatchEvent(event);
  return event;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("dialog", () => {
  it("opens as a modal with the heading and a labelled close button", async () => {
    const { dialog } = await openDialog();

    expect(dialog.open).toBe(true);
    expect(native(dialog).open).toBe(true);
    expect(dialog.shadowRoot!.querySelector("h2")!.textContent).toBe("Details");
    expect(closeButton(dialog).getAttribute("aria-label")).toBe("Zamknij");
    expect(deepActive()).toBe(closeButton(dialog));
  });

  it.each([
    ["Esc", (dialog: LibrusDialog) => press(dialog, "Escape")],
    ["the backdrop", (dialog: LibrusDialog) => native(dialog).click()],
    ["the close button", (dialog: LibrusDialog) => closeButton(dialog).click()],
    ["the native cancel", (dialog: LibrusDialog) =>
      native(dialog).dispatchEvent(new Event("cancel", { cancelable: true }))],
  ])("closes on %s, fires closed and gives focus back", async (_, action) => {
    const { dialog, opener } = await openDialog();
    let closed = 0;
    dialog.addEventListener("closed", () => closed++);

    action(dialog);
    await dialog.updateComplete;

    expect(dialog.open).toBe(false);
    expect(native(dialog).open).toBe(false);
    expect(closed).toBe(1);
    expect(document.activeElement).toBe(opener);
  });

  it("stays open on a click inside the panel", async () => {
    const { dialog } = await openDialog();

    dialog.querySelector("p")!.click();
    await dialog.updateComplete;

    expect(dialog.open).toBe(true);
  });

  it("keeps Tab focus inside: forward from the last, back from the first", async () => {
    const { dialog } = await openDialog();
    const last = dialog.querySelector<HTMLElement>("#second")!;

    last.focus();
    const forward = press(dialog, "Tab");
    expect(forward.defaultPrevented).toBe(true);
    expect(deepActive()).toBe(closeButton(dialog));

    const back = press(dialog, "Tab", true);
    expect(back.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  it("lets Tab move normally between inner elements", async () => {
    const { dialog } = await openDialog();
    dialog.querySelector<HTMLElement>("#first")!.focus();

    expect(press(dialog, "Tab").defaultPrevented).toBe(false);
    expect(press(dialog, "x").defaultPrevented).toBe(false);
  });

  it("close() on a closed dialog does nothing", async () => {
    const dialog = await mount<LibrusDialog>(DIALOG);
    let closed = 0;
    dialog.addEventListener("closed", () => closed++);

    dialog.close();
    await dialog.updateComplete;

    expect(closed).toBe(0);
  });
});
