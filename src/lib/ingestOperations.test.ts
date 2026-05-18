import { describe, expect, it, vi } from "vitest";
import type { Db } from "mongodb";
import { applyIngestOperation } from "@/lib/ingestOperations";

function mockDb(handlers: Record<string, Record<string, ReturnType<typeof vi.fn>>>) {
  return {
    collection: (name: string) => {
      const h = handlers[name] ?? {};
      return {
        find: h.find ?? vi.fn(() => ({ toArray: async () => [] })),
        findOne: h.findOne ?? vi.fn(async () => null),
        deleteMany: h.deleteMany ?? vi.fn(async () => ({ deletedCount: 0 })),
        insertMany: h.insertMany ?? vi.fn(async () => ({ insertedCount: 0 })),
        replaceOne: h.replaceOne ?? vi.fn(async () => ({ modifiedCount: 1 })),
      };
    },
  } as unknown as Db;
}

const emptyBatch = { providerIdsInBatch: new Set<string>(), replaceAllConfirmed: false };

describe("applyIngestOperation", () => {
  it("blocks providers.replaceAll without confirmation", async () => {
    const db = mockDb({
      providers: { deleteMany: vi.fn(), insertMany: vi.fn() },
    });
    const res = await applyIngestOperation(
      db,
      { resource: "providers", action: "replaceAll", documents: [] },
      emptyBatch,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("replaceAll blocked");
  });

  it("allows providers.replaceAll with confirmReplaceAll", async () => {
    const deleteMany = vi.fn(async () => ({ deletedCount: 0 }));
    const db = mockDb({ providers: { deleteMany, insertMany: vi.fn() } });
    const res = await applyIngestOperation(
      db,
      { resource: "providers", action: "replaceAll", documents: [], confirmReplaceAll: true },
      emptyBatch,
    );
    expect(res.ok).toBe(true);
    expect(deleteMany).toHaveBeenCalled();
  });

  it("allows providers.replaceAll when batch header flag set", async () => {
    const deleteMany = vi.fn(async () => ({ deletedCount: 0 }));
    const db = mockDb({ providers: { deleteMany, insertMany: vi.fn() } });
    const res = await applyIngestOperation(
      db,
      { resource: "providers", action: "replaceAll", documents: [] },
      { ...emptyBatch, replaceAllConfirmed: true },
    );
    expect(res.ok).toBe(true);
  });

  it("lists providers", async () => {
    const toArray = vi.fn(async () => [{ id: "prov-test", name: "Test", _id: "x" }]);
    const db = mockDb({
      providers: { find: vi.fn(() => ({ toArray })) },
    });
    const res = await applyIngestOperation(db, { resource: "providers", action: "list" }, emptyBatch);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Array.isArray(res.data)).toBe(true);
      expect((res.data as { id: string }[])[0].id).toBe("prov-test");
    }
  });

  it("rejects unknown resource", async () => {
    const db = mockDb({});
    const res = await applyIngestOperation(db, { resource: "nope", action: "list" }, emptyBatch);
    expect(res.ok).toBe(false);
  });

  it("returns location validation error instead of throwing on provider upsert", async () => {
    const replaceOne = vi.fn(async () => ({ modifiedCount: 1 }));
    const db = mockDb({
      providers: { replaceOne, findOne: vi.fn(async () => null) },
      events: { find: vi.fn(() => ({ toArray: async () => [] })) },
    });
    const locales = {
      hu: { name: "T", shortDescription: "S", longDescription: "L\n\nSources: https://example.com", slug: "t-hu" },
      es: { name: "T", shortDescription: "S", longDescription: "L\n\nSources: https://example.com", slug: "t-es" },
      it: { name: "T", shortDescription: "S", longDescription: "L\n\nSources: https://example.com", slug: "t-it" },
      he: { name: "T", shortDescription: "S", longDescription: "L\n\nSources: https://example.com", slug: "t-he" },
      ar: { name: "T", shortDescription: "S", longDescription: "L\n\nSources: https://example.com", slug: "t-ar" },
    };
    const res = await applyIngestOperation(
      db,
      {
        resource: "provider",
        action: "upsert",
        document: {
          id: "prov-test-location-reject",
          name: "Location Test",
          category: "Cafés",
          borough: "Belváros",
          neighborhood: "Inner City",
          address: "9999 Budapest, Nowhere utca 1, Hungary",
          shortDescription: "Test.",
          longDescription: "Test.\n\nSources: https://example.com",
          locales,
        },
      },
      emptyBatch,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/borough/i);
    expect(replaceOne).not.toHaveBeenCalled();
  });
});
