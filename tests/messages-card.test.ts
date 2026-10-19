import { afterEach, describe, expect, it } from "vitest";

import "../src/index";
import {
  MESSAGES_CARD,
  MESSAGES_EDITOR,
  MessagesCard,
  type Message,
  type MessagesCardConfig,
} from "../src/cards/messages-card";
import type { LibrusDialog } from "../src/common/dialog";
import type { FormField } from "../src/common/editor";
import { mockHass, mount } from "./helpers";

const ENTITY = "sensor.zofia_testowa_wiadomosci";

function message(id: number, changes: Partial<Message> = {}): Message {
  return {
    id: String(id),
    author: `Autor ${id}`,
    title: `Wiadomość ${id}`,
    date: "2026-10-19T08:15:02+02:00",
    unread: false,
    has_attachment: false,
    content_cached: false,
    ...changes,
  };
}

const MESSAGES = [
  message(1, { unread: true, has_attachment: true, title: "Zmiana planu" }),
  message(2, { unread: true }),
  message(3, { has_attachment: true }),
  ...[4, 5, 6, 7, 8].map((id) => message(id)),
];

async function card(config: Partial<MessagesCardConfig> = {}, language = "pl", messages = MESSAGES) {
  return mount<MessagesCard>(MESSAGES_CARD, (el) => {
    el.setConfig({ type: `custom:${MESSAGES_CARD}`, entity: ENTITY, ...config });
    el.hass = mockHass({ [ENTITY]: { state: "2", attributes: { messages } } }, language);
  });
}

function rows(el: MessagesCard): HTMLLIElement[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLLIElement>("li")];
}

function icon(el: Element | null): string | undefined {
  return (el as (HTMLElement & { icon?: string }) | null)?.icon;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("messages card", () => {
  it("is defined and listed in the card picker", () => {
    expect(customElements.get(MESSAGES_CARD)).toBe(MessagesCard);
    expect(window.customCards?.find((c) => c.type === MESSAGES_CARD)?.name).toBe("Librus messages");
  });

  it("shows the last 5 messages by default, newest first", async () => {
    const el = await card();

    expect(rows(el).map((row) => row.querySelector(".title")!.textContent)).toEqual([
      "Zmiana planu",
      "Wiadomość 2",
      "Wiadomość 3",
      "Wiadomość 4",
      "Wiadomość 5",
    ]);
    expect(el.shadowRoot!.querySelector(".card-header")!.textContent!.trim()).toBe("Wiadomości");
  });

  it("follows the count option", async () => {
    expect(rows(await card({ count: 2 }))).toHaveLength(2);
    expect(rows(await card({ count: 100 }))).toHaveLength(MESSAGES.length);
  });

  it("marks unread messages by icon, colour class and bold title", async () => {
    const [unread, , read] = rows(await card());

    expect(unread.className).toBe("unread");
    expect(icon(unread.querySelector(".status"))).toBe("mdi:email");
    expect(unread.querySelector(".status")!.getAttribute("title")).toBe("Nieprzeczytana");
    expect(read.className).toBe("read");
    expect(icon(read.querySelector(".status"))).toBe("mdi:email-open-outline");
  });

  it("shows the attachment icon only for messages with attachments", async () => {
    const [first, second, third] = rows(await card());

    expect(icon(first.querySelector(".attachment"))).toBe("mdi:paperclip");
    expect(second.querySelector(".attachment")).toBeNull();
    expect(third.querySelector(".attachment")).not.toBeNull();
  });

  it("shows author and date on the second line", async () => {
    const [first] = rows(await card());
    expect(first.querySelector(".meta")!.textContent).toBe("Autor 1 · 19.10.2026, 08:15");
  });

  it("hides the elements that the fields option leaves out", async () => {
    const [first] = rows(await card({ fields: ["date"] }));

    expect(first.querySelector(".meta")!.textContent).toBe("19.10.2026, 08:15");
    expect(first.querySelector(".status")).toBeNull();
    expect(first.querySelector(".attachment")).toBeNull();
    expect(first.querySelector(".title")!.textContent).toBe("Zmiana planu");

    const [bare] = rows(await card({ fields: [] }));
    expect(bare.querySelector(".meta")).toBeNull();
  });

  it("opens a pop-up with all details on click", async () => {
    const el = await card({}, "en");

    rows(el)[0].querySelector("button")!.click();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
    await dialog.updateComplete;

    expect(dialog.open).toBe(true);
    expect(dialog.heading).toBe("Zmiana planu");
    const details = [...dialog.querySelectorAll("dt")].map((dt) => [
      dt.textContent,
      dt.nextElementSibling!.textContent,
    ]);
    expect(details).toEqual([
      ["From", "Autor 1"],
      ["Date", "10/19/26, 8:15 AM"],
      ["Status", "Unread"],
      ["Attachments", "Yes"],
    ]);

    dialog.close();
    await dialog.updateComplete;
    await el.updateComplete;
    expect(dialog.querySelector("dl")).toBeNull();
  });

  it("says so when there are no messages", async () => {
    const el = await card({}, "en", []);
    expect(el.shadowRoot!.querySelector(".empty")!.textContent).toBe("No messages");
    expect(el.getCardSize()).toBe(2);
  });

  it("warns when the sensor does not exist", async () => {
    const el = await mount<MessagesCard>(MESSAGES_CARD, (c) => {
      c.setConfig({ type: `custom:${MESSAGES_CARD}`, entity: "sensor.missing" });
      c.hass = mockHass();
    });
    expect(el.shadowRoot!.querySelector(".warning")).not.toBeNull();
  });

  it.each([
    [{}, "Entity required"],
    [{ entity: ENTITY, count: 0 }, "count must be"],
    [{ entity: ENTITY, count: 101 }, "count must be"],
    [{ entity: ENTITY, count: 2.5 }, "count must be"],
  ])("rejects config %j", (config, error) => {
    expect(() => new MessagesCard().setConfig({ type: "x", ...config })).toThrow(error);
  });

  it("suggests the first Librus messages sensor in the card picker", () => {
    const hass = mockHass({
      "sensor.zofia_testowa_klasa": { state: "5a" },
      [ENTITY]: { state: "0", attributes: { messages: [] } },
    });
    expect(MessagesCard.getStubConfig(hass)).toEqual({ type: `custom:${MESSAGES_CARD}`, entity: ENTITY });
    expect(MessagesCard.getStubConfig(mockHass()).entity).toBe("");
  });
});

describe("messages card editor", () => {
  it("offers entity, title, icon, count and fields with defaults", async () => {
    const editor = await mount<HTMLElement & { updateComplete: Promise<unknown>; hass: unknown; setConfig(c: object): void }>(
      MESSAGES_EDITOR,
      (el) => {
        el.hass = mockHass({}, "pl");
        el.setConfig({ type: `custom:${MESSAGES_CARD}`, entity: ENTITY });
      },
    );
    const form = editor.shadowRoot!.querySelector("ha-form") as HTMLElement & {
      data: MessagesCardConfig;
      schema: FormField[];
    };

    expect(form.data).toMatchObject({ entity: ENTITY, count: 5, fields: ["author", "date", "attachment", "status"] });
    const names = form.schema.flatMap((f) => (f.schema ? f.schema.map((s) => s.name) : [f.name]));
    expect(names).toEqual([
      "entity",
      "title",
      "icon",
      "icon_color",
      "count",
      "fields",
      "unread_color",
      "highlight_unread",
    ]);
    expect(form.data).toMatchObject({ unread_color: "primary", highlight_unread: false });
    const fields = form.schema.find((f) => f.name === "fields")!.selector!.select as {
      options: { value: string; label: string }[];
    };
    expect(fields.options.map((o) => o.label)).toEqual([
      "Autor",
      "Data",
      "Ikona załącznika",
      "Ikona przeczytania",
    ]);
    expect(form.schema.find((f) => f.name === "count")!.selector).toEqual({
      number: { min: 1, max: 100, mode: "box" },
    });
  });
});

describe("messages card colours and highlight", () => {
  function unreadColor(el: MessagesCard): string {
    return el.shadowRoot!.querySelector<HTMLElement>("ha-card")!.style.getPropertyValue("--librus-unread-color");
  }

  it("marks unread messages in the primary colour by default, without highlight", async () => {
    const el = await card();

    expect(unreadColor(el)).toBe("var(--primary-color)");
    expect(rows(el)[0].className).toBe("unread");
  });

  it("uses the chosen colour for the unread marks", async () => {
    expect(unreadColor(await card({ unread_color: "red" }))).toBe("var(--red-color)");
    expect(unreadColor(await card({ unread_color: "#ff8800" }))).toBe("#ff8800");
  });

  it("highlights unread rows only when asked", async () => {
    const [unread, , read] = rows(await card({ highlight_unread: true, unread_color: "green" }));

    expect(unread.className).toBe("unread highlight");
    expect(read.className).toBe("read");
  });

  it("colours the header icon", async () => {
    const icon = (el: MessagesCard) =>
      el.shadowRoot!.querySelector<HTMLElement>(".card-header ha-icon")!.style.color;

    expect(icon(await card({ icon_color: "amber" }))).toBe("var(--amber-color)");
    expect(icon(await card())).toBe("");
  });
});
