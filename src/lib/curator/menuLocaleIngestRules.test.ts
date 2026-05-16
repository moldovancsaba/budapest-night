import { describe, expect, it } from "vitest";
import {
  validateMenuItemLocalesForIngest,
  validateMenuSectionLocalesForIngest,
} from "@/lib/curator/menuLocaleIngestRules";

const fullItemLocales = {
  hu: { name: "Teszt" },
  es: { name: "Prueba" },
  it: { name: "Prova" },
  he: { name: "בדיקה" },
  ar: { name: "اختبار" },
};

describe("menuLocaleIngestRules", () => {
  it("requires all menu item locale keys", () => {
    expect(validateMenuItemLocalesForIngest(undefined, "item").length).toBeGreaterThan(0);
    expect(validateMenuItemLocalesForIngest(fullItemLocales, "item")).toEqual([]);
  });

  it("requires section title per locale", () => {
    expect(
      validateMenuSectionLocalesForIngest(
        {
          hu: { title: "Italok" },
          es: { title: "Bebidas" },
          it: { title: "Bevande" },
          he: { title: "משקאות" },
          ar: { title: "مشروبات" },
        },
        "sec",
      ),
    ).toEqual([]);
  });
});
