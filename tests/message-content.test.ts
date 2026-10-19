import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/index";
import { MESSAGES_CARD, type Message, type MessagesCard } from "../src/cards/messages-card";
import type { MessageContent } from "../src/common/api";
import type { LibrusDialog } from "../src/common/dialog";
import type { HomeAssistant } from "../src/types";
import { mockHass, mount } from "./helpers";

const ENTITY = "sensor.zofia_testowa_wiadomosci";

const NEW: Message = {
  id: "5001",
  author: "Sekretariat Szkoły",
  title: "Zmiana planu",
  date: "2026-10-19T08:15:02+02:00",
  unread: true,
  has_attachment: true,
  content_cached: false,
};
const CACHED: Message = { ...NEW, id: "5002", title: "Wycieczka", content_cached: true, unread: false };

const CONTENT: MessageContent = {
  id: "5001",
  author: "Sekretariat Szkoły",
  title: "Zmiana planu",
  date: "2026-10-19T08:15:02+02:00",
  content: "Od poniedziałku obowiązuje nowy plan.\nDruga linia.",
  attachments: ["plan.pdf", "sale.xlsx"],
};

type Call = (message: Record<string, unknown>) => Promise<unknown>;

async function setup(callWS: Call, messages: Message[] = [NEW, CACHED]) {
  const hass = mockHass({ [ENTITY]: { state: "1", attributes: { messages } } }, "pl");
  hass.callWS = vi.fn(callWS) as HomeAssistant["callWS"];
  const card = await mount<MessagesCard>(MESSAGES_CARD, (el) => {
    el.setConfig({ type: `custom:${MESSAGES_CARD}`, entity: ENTITY });
    el.hass = hass;
  });
  return { card, hass, callWS: hass.callWS as unknown as ReturnType<typeof vi.fn> };
}

async function settle(card: MessagesCard): Promise<LibrusDialog> {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await card.updateComplete;
  }
  const dialog = card.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
  await dialog.updateComplete;
  return dialog;
}

async function open(card: MessagesCard, index: number): Promise<LibrusDialog> {
  card.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.row")[index].click();
  return settle(card);
}

function readButton(dialog: LibrusDialog): HTMLButtonElement | null {
  return dialog.querySelector<HTMLButtonElement>(".body button.link");
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("message content", () => {
  it("is read only on request: a button, a hint, no call on open", async () => {
    const { card, callWS } = await setup(async () => ({ response: CONTENT }));

    const dialog = await open(card, 0);

    expect(callWS).not.toHaveBeenCalled();
    expect(readButton(dialog)!.textContent!.trim()).toBe("Wczytaj treść");
    expect(dialog.querySelector(".hint")!.textContent).toBe(
      "Wczytanie treści oznacza wiadomość w Librusie jako przeczytaną.",
    );
  });

  it("calls the action once and shows the body and attachment names", async () => {
    const { card, callWS } = await setup(async () => ({ response: CONTENT }));
    const dialog = await open(card, 0);

    readButton(dialog)!.click();
    await settle(card);

    expect(callWS).toHaveBeenCalledTimes(1);
    expect(callWS).toHaveBeenCalledWith({
      type: "call_service",
      domain: "librus_apix",
      service: "get_message_content",
      service_data: { entity_id: ENTITY, message_id: "5001" },
      return_response: true,
    });
    expect(dialog.querySelector(".content")!.textContent).toBe(CONTENT.content);
    expect([...dialog.querySelectorAll(".files li")].map((li) => li.textContent)).toEqual([
      "plan.pdf",
      "sale.xlsx",
    ]);
    expect(readButton(dialog)).toBeNull();
  });

  it("shows a content read before without another call", async () => {
    const { card, callWS } = await setup(async () => ({ response: CONTENT }));
    let dialog = await open(card, 0);
    readButton(dialog)!.click();
    await settle(card);
    dialog.close();
    await settle(card);

    dialog = await open(card, 0);

    expect(callWS).toHaveBeenCalledTimes(1);
    expect(dialog.querySelector(".content")!.textContent).toBe(CONTENT.content);
  });

  it("opens a content the integration keeps directly, without the button", async () => {
    const { card, callWS } = await setup(async () => ({
      response: { ...CONTENT, id: "5002", content: "Zgody do piątku." },
    }));

    const dialog = await open(card, 1);

    expect(callWS).toHaveBeenCalledTimes(1);
    expect(dialog.querySelector(".content")!.textContent).toBe("Zgody do piątku.");
    expect(readButton(dialog)).toBeNull();
  });

  it("shows loading while the call runs and ignores a second click", async () => {
    let finish: (value: unknown) => void = () => undefined;
    const { card, callWS } = await setup(() => new Promise((resolve) => (finish = resolve)));
    const dialog = await open(card, 0);

    readButton(dialog)!.click();
    await settle(card);
    expect(dialog.querySelector(".hint")!.textContent).toBe("Wczytywanie…");
    expect(readButton(dialog)).toBeNull();

    finish({ response: CONTENT });
    await settle(card);
    expect(callWS).toHaveBeenCalledTimes(1);
    expect(dialog.querySelector(".content")).not.toBeNull();
  });

  it("shows a readable error and reads again on retry", async () => {
    let attempt = 0;
    const { card, callWS } = await setup(async () => {
      attempt++;
      if (attempt === 1) {
        throw { code: "home_assistant_error", message: "Cannot read the message from Librus: no connection" };
      }
      return { response: CONTENT };
    });
    const dialog = await open(card, 0);

    readButton(dialog)!.click();
    await settle(card);

    expect(dialog.querySelector(".error")!.textContent).toBe(
      "Nie udało się wczytać treści: Cannot read the message from Librus: no connection",
    );
    expect(readButton(dialog)!.textContent!.trim()).toBe("Spróbuj ponownie");

    readButton(dialog)!.click();
    await settle(card);
    expect(callWS).toHaveBeenCalledTimes(2);
    expect(dialog.querySelector(".error")).toBeNull();
    expect(dialog.querySelector(".content")!.textContent).toBe(CONTENT.content);
  });

  it("follows the sensor: the message turns read after the content was read", async () => {
    const { card, hass } = await setup(async () => ({ response: CONTENT }));
    const dialog = await open(card, 0);
    readButton(dialog)!.click();
    await settle(card);

    card.hass = mockHass(
      { [ENTITY]: { state: "0", attributes: { messages: [{ ...NEW, unread: false, content_cached: true }, CACHED] } } },
      "pl",
    );
    card.hass.callWS = hass.callWS;
    await settle(card);

    const status = [...dialog.querySelectorAll("dt")].find((dt) => dt.textContent === "Status")!;
    expect(status.nextElementSibling!.textContent).toBe("Przeczytana");
    expect(card.shadowRoot!.querySelector("li")!.className).toBe("read");
  });
});
