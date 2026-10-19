import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";

import { LibrusCard, type BaseCardConfig } from "../src/common/base-card";
import { LibrusCardEditor, baseFields, type FormField } from "../src/common/editor";
import { mockHass, mount } from "./helpers";

class TestCard extends LibrusCard<BaseCardConfig> {
  renders = 0;

  protected get defaultTitle(): string {
    return this.t("placeholder.name");
  }

  protected get defaultIcon(): string {
    return "mdi:school";
  }

  protected override render() {
    this.renders++;
    if (!this._config) {
      return html``;
    }
    if (this._config.entity && !this.stateObj) {
      return this.renderMissingEntity();
    }
    return html`<ha-card>${this.renderHeader()}<div class="card-content">${this.stateObj?.state}</div></ha-card>`;
  }
}
customElements.define("test-librus-card", TestCard);

class TestEditor extends LibrusCardEditor<BaseCardConfig> {
  protected get schema(): FormField[] {
    return baseFields("calendar");
  }
}
customElements.define("test-librus-editor", TestEditor);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("base card", () => {
  it("shows the default title and icon in the HA language", async () => {
    const card = await mount<TestCard>("test-librus-card", (el) => {
      el.setConfig({ type: "custom:test" });
      el.hass = mockHass({}, "pl");
    });

    const header = card.shadowRoot!.querySelector(".card-header")!;
    expect(header.textContent?.trim()).toBe("Karty Librus APIX");
    expect((header.querySelector("ha-icon") as HTMLElement & { icon: string }).icon).toBe("mdi:school");
  });

  it("uses the configured title and icon; an empty title hides the header", async () => {
    const card = await mount<TestCard>("test-librus-card", (el) => {
      el.setConfig({ type: "custom:test", title: "Terminarz Zosi", icon: "mdi:calendar" });
    });
    expect(card.shadowRoot!.querySelector(".card-header .name")!.textContent).toBe("Terminarz Zosi");

    card.setConfig({ type: "custom:test", title: "" });
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector(".card-header")).toBeNull();
  });

  it("warns when the entity does not exist", async () => {
    const card = await mount<TestCard>("test-librus-card", (el) => {
      el.setConfig({ type: "custom:test", entity: "calendar.missing" });
      el.hass = mockHass();
    });

    expect(card.shadowRoot!.querySelector(".warning")!.textContent).toBe(
      "Entity not found: calendar.missing",
    );
  });

  it("renders again only when its entity or the language changes", async () => {
    const card = await mount<TestCard>("test-librus-card", (el) => {
      el.setConfig({ type: "custom:test", entity: "calendar.a" });
      el.hass = mockHass({ "calendar.a": { state: "on" }, "sensor.b": { state: "1" } });
    });
    const before = card.renders;
    const states = card.hass!.states;

    card.hass = { ...card.hass!, states: { ...states, "sensor.b": { ...states["sensor.b"], state: "2" } } };
    await card.updateComplete;
    expect(card.renders).toBe(before);

    card.hass = { ...card.hass!, states: { ...card.hass!.states, "calendar.a": { ...states["calendar.a"], state: "off" } } };
    await card.updateComplete;
    expect(card.renders).toBe(before + 1);
    expect(card.shadowRoot!.querySelector(".card-content")!.textContent).toBe("off");

    card.hass = { ...card.hass!, locale: { language: "pl" } };
    await card.updateComplete;
    expect(card.renders).toBe(before + 2);
  });

  it("rejects an empty config and sizes for sections views", () => {
    const card = new TestCard();
    expect(() => card.setConfig(undefined as unknown as BaseCardConfig)).toThrow("Invalid configuration");
    expect(card.getGridOptions()).toEqual({ columns: 12, min_columns: 6, rows: "auto" });
    expect(card.getCardSize()).toBe(3);
  });
});

describe("card editor", () => {
  it("passes config, schema and translated labels to ha-form", async () => {
    const editor = await mount<TestEditor>("test-librus-editor", (el) => {
      el.hass = mockHass({}, "pl");
      el.setConfig({ type: "custom:test", entity: "calendar.a" });
    });

    const form = editor.shadowRoot!.querySelector("ha-form") as HTMLElement & {
      data: BaseCardConfig;
      schema: FormField[];
      computeLabel: (field: FormField) => string;
    };
    expect(form.data).toEqual({ type: "custom:test", entity: "calendar.a" });
    expect(form.schema[0]).toMatchObject({ name: "entity", required: true });
    expect(form.computeLabel({ name: "title" })).toBe("Tytuł");
    expect(form.computeLabel({ name: "" })).toBe("");
  });

  it("fires config-changed with the new config, without empty fields", async () => {
    const editor = await mount<TestEditor>("test-librus-editor", (el) => {
      el.hass = mockHass();
      el.setConfig({ type: "custom:test" });
    });
    const changes: BaseCardConfig[] = [];
    editor.addEventListener("config-changed", (e) => changes.push((e as CustomEvent).detail.config));

    editor.shadowRoot!.querySelector("ha-form")!.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: { type: "custom:test", entity: "calendar.a", title: "", icon: undefined } },
      }),
    );

    expect(changes).toEqual([{ type: "custom:test", entity: "calendar.a" }]);
  });

  it("renders nothing without hass", async () => {
    const editor = await mount<TestEditor>("test-librus-editor", (el) => el.setConfig({ type: "x" }));
    expect(editor.shadowRoot!.querySelector("ha-form")).toBeNull();
  });
});
