import { describe, expect, it, vi } from "vitest";

import "../src/index";
import { PLACEHOLDER_CARD, PlaceholderCard } from "../src/cards/placeholder-card";
import { VERSION } from "../src/version";

describe("bundle registration", () => {
  it("defines the card and lists it in the card picker", () => {
    expect(customElements.get(PLACEHOLDER_CARD)).toBe(PlaceholderCard);
    expect(window.customCards?.map((card) => card.type)).toContain(PLACEHOLDER_CARD);
  });

  it("does not list a card twice when the module is evaluated again", async () => {
    vi.resetModules();
    await import("../src/index");
    const entries = window.customCards?.filter((card) => card.type === PLACEHOLDER_CARD);
    expect(entries).toHaveLength(1);
  });
});

describe("placeholder card", () => {
  it("renders the bundle version inside an ha-card", async () => {
    const card = document.createElement(PLACEHOLDER_CARD) as PlaceholderCard;
    card.setConfig({ type: `custom:${PLACEHOLDER_CARD}` });
    document.body.append(card);
    await card.updateComplete;

    const content = card.shadowRoot?.querySelector("ha-card .content");
    expect(content?.textContent).toContain(`Librus APIX Cards ${VERSION}`);
    expect(card.getCardSize()).toBe(1);
    card.remove();
  });

  it("renders nothing before it has a config", async () => {
    const card = document.createElement(PLACEHOLDER_CARD) as PlaceholderCard;
    document.body.append(card);
    await card.updateComplete;

    expect(card.shadowRoot?.querySelector("ha-card")).toBeNull();
    card.remove();
  });
});
