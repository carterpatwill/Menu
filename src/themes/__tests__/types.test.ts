import { describe, it, expect } from "vitest";
import { CATEGORY_LABELS } from "@/themes/types";

const ALL_CATEGORIES = [
  "specials",
  "appetizers",
  "mains",
  "sides",
  "drinks",
  "desserts",
] as const;

describe("CATEGORY_LABELS", () => {
  it("has a label for every category", () => {
    for (const category of ALL_CATEGORIES) {
      expect(CATEGORY_LABELS[category]).toBeDefined();
    }
  });

  it("all labels are non-empty strings", () => {
    for (const category of ALL_CATEGORIES) {
      expect(typeof CATEGORY_LABELS[category]).toBe("string");
      expect(CATEGORY_LABELS[category].length).toBeGreaterThan(0);
    }
  });

  it("label for 'mains' is 'Mains'", () => {
    expect(CATEGORY_LABELS["mains"]).toBe("Mains");
  });
});
