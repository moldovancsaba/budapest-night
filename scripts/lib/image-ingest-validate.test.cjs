const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { validatePayloadImages, buildCatalogImageIndex } = require("./image-ingest-validate.cjs");

describe("validatePayloadImages", () => {
  const providers = [{ id: "prov-a", name: "A", image: "https://i.ibb.co/x/existing.jpg" }];
  const events = [];
  const meetups = [];
  const providersById = new Map(providers.map((p) => [p.id, p]));

  it("rejects duplicate provider image vs catalog", () => {
    const errors = validatePayloadImages(
      [
        {
          resource: "provider",
          action: "upsert",
          document: {
            id: "prov-b",
            image: "https://i.ibb.co/x/existing.jpg",
          },
        },
      ],
      { providers, events, meetups, providersById },
    );
    assert.ok(errors.some((e) => e.includes("already used")));
  });

  it("rejects banned hash", () => {
    const errors = validatePayloadImages(
      [
        {
          resource: "meetupGroup",
          action: "upsert",
          document: {
            id: "grp-x",
            coverImageUrl: "https://i.ibb.co/FqwVgd7n/cde3b78d5c56.jpg",
          },
        },
      ],
      { providers, events, meetups, providersById },
    );
    assert.ok(errors.some((e) => e.includes("cde3b78d5c56")));
  });

  it("rejects event image matching host provider image", () => {
    const errors = validatePayloadImages(
      [
        {
          resource: "event",
          action: "upsert",
          document: {
            id: "event-x",
            image: "https://i.ibb.co/x/existing.jpg",
            venueIds: ["prov-a"],
          },
        },
      ],
      { providers, events, meetups, providersById },
    );
    assert.ok(errors.some((e) => e.includes("primary host")));
  });
});

describe("buildCatalogImageIndex", () => {
  it("indexes all listing types", () => {
    const idx = buildCatalogImageIndex(
      [{ id: "p1", image: "https://i.ibb.co/a/1.jpg" }],
      [{ id: "e1", image: "https://i.ibb.co/b/2.jpg", title: "Show" }],
      [{ id: "g1", coverImageUrl: "https://i.ibb.co/c/3.jpg", name: "Circle" }],
    );
    assert.equal(idx.get("https://i.ibb.co/a/1.jpg")?.[0]?.kind, "provider");
    assert.equal(idx.get("https://i.ibb.co/b/2.jpg")?.[0]?.kind, "event");
    assert.equal(idx.get("https://i.ibb.co/c/3.jpg")?.[0]?.kind, "meetupGroup");
  });
});
