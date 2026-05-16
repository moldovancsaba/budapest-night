import { describe, expect, it } from "vitest";
import { timingSafeStringEqual } from "@/lib/timingSafeStringEqual";

describe("timingSafeStringEqual", () => {
  it("returns true for equal strings", () => {
    expect(timingSafeStringEqual("secret", "secret")).toBe(true);
  });

  it("returns false for different strings of equal length", () => {
    expect(timingSafeStringEqual("secret", "secrex")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(timingSafeStringEqual("short", "longer")).toBe(false);
  });
});
