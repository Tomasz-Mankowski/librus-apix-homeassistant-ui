import { afterEach, describe, expect, it } from "vitest";

import "../src/index";
import {
  ANNOUNCEMENTS_CARD,
  ANNOUNCEMENTS_EDITOR,
  AnnouncementsCard,
  type Announcement,
  type AnnouncementsCardConfig,
} from "../src/cards/announcements-card";
import type { LibrusDialog } from "../src/common/dialog";
import type { FormField } from "../src/common/editor";
import { mockHass, mount } from "./helpers";

const ENTITY = "sensor.zofia_testowa_ogloszenia";

function item(n: number, changes: Partial<Announcement> = {}): Announcement {
  return {
    id: `a${n}`,
    title: `Ogłoszenie ${n}`,
    author: `Autor ${n}`,
    date: `2026-10-${String(20 - n).padStart(2, "0")}`,
    content: `Pierwsza linia ${n}.\nDruga linia ${n}.`,
    ...changes,
  };
}

const ITEMS = [1, 2, 3, 4, 5, 6, 7].map((n) => item(n));

async function card(config: Partial<AnnouncementsCardConfig> = {}, language = "pl", items = ITEMS) {
  return mount<AnnouncementsCard>(ANNOUNCEMENTS_CARD, (el) => {
    el.setConfig({ type: `custom:${ANNOUNCEMENTS_CARD}`, entity: ENTITY, ...config });
    el.hass = mockHass({ [ENTITY]: { state: String(items.length), attributes: { announcements: items } } }, language);
  });
}

function rows(el: AnnouncementsCard): HTMLLIElement[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLLIElement>("ul.items > li")];
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("announcements card", () => {
  it("is defined and listed in the card picker", () => {
    expect(customElements.get(ANNOUNCEMENTS_CARD)).toBe(AnnouncementsCard);
    expect(window.customCards?.find((c) => c.type === ANNOUNCEMENTS_CARD)?.name).toBe(
      "Librus announcements",
    );
  });

  it("shows the last 5 with title, author and date by default", async () => {
    const el = await card();

    expect(rows(el)).toHaveLength(5);
    const [first] = rows(el);
    expect(first.querySelector(".title")!.textContent).toBe("Ogłoszenie 1");
    expect(first.querySelector(".meta")!.textContent).toBe("Autor 1 · 19.10.2026");
    expect(first.querySelector(".preview")).toBeNull();
    expect(el.shadowRoot!.querySelector(".card-header")!.textContent!.trim()).toBe("Ogłoszenia");
  });

  it("follows the count and fields options", async () => {
    expect(rows(await card({ count: 2 }))).toHaveLength(2);
    expect(rows(await card({ count: 50 }))).toHaveLength(ITEMS.length);

    const [first] = rows(await card({ fields: ["date", "preview"] }));
    expect(first.querySelector(".meta")!.textContent).toBe("19.10.2026");
    expect(first.querySelector(".preview")!.textContent).toBe("Pierwsza linia 1.");

    const [bare] = rows(await card({ fields: [] }));
    expect(bare.querySelector(".meta")).toBeNull();
  });

  it("opens a pop-up with the full text", async () => {
    const el = await card({}, "en");

    rows(el)[1].querySelector("button")!.click();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
    await dialog.updateComplete;

    expect(dialog.open).toBe(true);
    expect(dialog.heading).toBe("Ogłoszenie 2");
    expect([...dialog.querySelectorAll("dt")].map((dt) => [dt.textContent, dt.nextElementSibling!.textContent])).toEqual([
      ["Author", "Autor 2"],
      ["Date", "10/18/26"],
    ]);
    expect(dialog.querySelector(".content")!.textContent).toBe("Pierwsza linia 2.\nDruga linia 2.");
  });

  it("keeps an open announcement shown when it leaves the list", async () => {
    const el = await card();
    rows(el)[0].querySelector("button")!.click();
    await el.updateComplete;

    el.hass = mockHass({ [ENTITY]: { state: "0", attributes: { announcements: [] } } }, "pl");
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector<LibrusDialog>("librus-apix-dialog")!;
    expect(dialog.heading).toBe("Ogłoszenie 1");
    expect(el.shadowRoot!.querySelector(".empty")!.textContent).toBe("Brak ogłoszeń");
  });

  it("warns when the sensor does not exist", async () => {
    const el = await mount<AnnouncementsCard>(ANNOUNCEMENTS_CARD, (c) => {
      c.setConfig({ type: `custom:${ANNOUNCEMENTS_CARD}`, entity: "sensor.missing" });
      c.hass = mockHass();
    });
    expect(el.shadowRoot!.querySelector(".warning")).not.toBeNull();
  });

  it.each([
    [{}, "Entity required"],
    [{ entity: ENTITY, count: 0 }, "count must be"],
    [{ entity: ENTITY, count: 101 }, "count must be"],
  ])("rejects config %j", (config, error) => {
    expect(() => new AnnouncementsCard().setConfig({ type: "x", ...config })).toThrow(error);
  });

  it("suggests the first Librus announcements sensor in the card picker", () => {
    const hass = mockHass({ [ENTITY]: { state: "0", attributes: { announcements: [] } } });
    expect(AnnouncementsCard.getStubConfig(hass).entity).toBe(ENTITY);
  });
});

describe("announcements card editor", () => {
  it("offers entity, title, icon, count and fields with defaults", async () => {
    const editor = await mount<HTMLElement & { updateComplete: Promise<unknown>; hass: unknown; setConfig(c: object): void }>(
      ANNOUNCEMENTS_EDITOR,
      (el) => {
        el.hass = mockHass({}, "pl");
        el.setConfig({ type: `custom:${ANNOUNCEMENTS_CARD}`, entity: ENTITY });
      },
    );
    const form = editor.shadowRoot!.querySelector("ha-form") as HTMLElement & {
      data: AnnouncementsCardConfig;
      schema: FormField[];
    };

    expect(form.data).toMatchObject({ count: 5, fields: ["author", "date"] });
    const names = form.schema.flatMap((f) => (f.schema ? f.schema.map((s) => s.name) : [f.name]));
    expect(names).toEqual(["entity", "title", "icon", "icon_color", "count", "fields"]);
    const options = (form.schema.find((f) => f.name === "fields")!.selector!.select as {
      options: { label: string }[];
    }).options;
    expect(options.map((o) => o.label)).toEqual(["Autor", "Data", "Pierwsza linia treści"]);
  });
});
