import { describe, expect, it } from "vitest";
import {
  cacheBustMediaUrl,
  isStaleSiteMediaUrl,
  resolveHomeHeroUrl,
} from "./siteMedia";

describe("siteMedia", () => {
  it("flags known bad home hero uploads", () => {
    expect(isStaleSiteMediaUrl("https://i.ibb.co/GQCgxnm0/cbe8e6335604.jpg")).toBe(true);
    expect(isStaleSiteMediaUrl("https://i.ibb.co/v068hnM/1bc7cfd47dfa.jpg")).toBe(false);
  });

  it("falls back to CMS default for stale mongo urls", () => {
    const resolved = resolveHomeHeroUrl("https://i.ibb.co/GQCgxnm0/cbe8e6335604.jpg");
    expect(resolved).toBe(resolveHomeHeroUrl(undefined));
    expect(resolved).toContain("i.ibb.co");
  });

  it("appends cache-bust query from filename hash", () => {
    expect(cacheBustMediaUrl("https://i.ibb.co/v068hnM/1bc7cfd47dfa.jpg")).toBe(
      "https://i.ibb.co/v068hnM/1bc7cfd47dfa.jpg?v=1bc7cfd47dfa",
    );
  });
});
