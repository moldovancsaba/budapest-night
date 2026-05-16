const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { validateScarcityNotes, findScarcestCategoryBorough } = require("./scarcity-ingest-validate.cjs");

describe("validateScarcityNotes", () => {
  const upsertOp = { resource: "provider", action: "upsert", document: {} };

  it("requires notes on cursor-curated listing payloads", () => {
    const errors = validateScarcityNotes("", "cursor-curated-venue-x.json", [upsertOp]);
    assert.ok(errors.length > 0);
  });

  it("passes when notes include counts and gap", () => {
    const errors = validateScarcityNotes(
      "Catalog: 145 providers; Óbuda Cafés 3; gap: sparsest slice Újbuda Restaurants",
      "cursor-curated-venue-x.json",
      [upsertOp],
    );
    assert.equal(errors.length, 0);
  });

  it("skips patch-only repair payloads", () => {
    const errors = validateScarcityNotes(
      "",
      "patch-unique-venue-meetup-images.json",
      [{ resource: "provider", action: "patch", id: "p", patch: { image: "https://i.ibb.co/x/y.jpg" } }],
    );
    assert.equal(errors.length, 0);
  });
});

describe("findScarcestCategoryBorough", () => {
  it("picks the smallest category+borough cell", () => {
    const providers = [
      { category: "Cafés", borough: "Óbuda" },
      { category: "Cafés", borough: "Óbuda" },
      { category: "Cafés", borough: "Belváros" },
      { category: "Venues", borough: "Óbuda" },
    ];
    const best = findScarcestCategoryBorough(providers);
    assert.equal(best.count, 1);
  });
});
