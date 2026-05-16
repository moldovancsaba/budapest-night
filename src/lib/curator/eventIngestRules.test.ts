import { describe, expect, it } from "vitest";
import { getEventIngestRulesForPrompt } from "./eventIngestRules";

describe("getEventIngestRulesForPrompt", () => {
  it("documents venues vs events, HUF tickets, and gold-standard path", () => {
    const rules = getEventIngestRulesForPrompt();
    expect(rules).toContain('resource: "event"');
    expect(rules).toContain("currency: \"HUF\"");
    expect(rules).toContain("seed-timed-events-moby-sting.json");
    expect(rules).toContain("Ferencváros");
    expect(rules).toContain('Never use `category: "Events"`');
  });
});
