/**
 * Catalog image uniqueness + banned hashes for ingest dry-run.
 * Keep BANNED_IMGBB_HASHES in sync with src/lib/curator/imageIngestRules.ts
 */

const BANNED_IMGBB_HASHES = [
  "cde3b78d5c56",
  "cb56a463140e",
  "cf91ad578e08",
  "5e673e7e0093",
  "038fd3264859",
];

function imgbbFilenameHash(url) {
  const u = String(url || "").trim();
  const m = u.match(/\/([^/]+)\.(jpg|jpeg|png|webp)$/i);
  return m ? m[1].replace(/\.(jpg|jpeg|png|webp)$/i, "") : "";
}

function validateBannedImageUrl(url, pathPrefix) {
  const errors = [];
  const u = String(url || "").trim();
  if (!u) return errors;
  const hash = imgbbFilenameHash(u);
  for (const banned of BANNED_IMGBB_HASHES) {
    if (hash.includes(banned) || u.includes(banned)) {
      errors.push(
        `${pathPrefix}: image URL uses banned hash ${banned} (concert/generic reuse) — upload a new unique official asset`,
      );
      break;
    }
  }
  return errors;
}

function buildCatalogImageIndex(providers, events, meetups) {
  const byUrl = new Map();
  const add = (url, kind, id, name) => {
    const u = String(url || "").trim();
    if (!u) return;
    if (!byUrl.has(u)) byUrl.set(u, []);
    byUrl.get(u).push({ kind, id, name: name || id });
  };
  for (const p of providers) add(p.image, "provider", p.id, p.name);
  for (const e of events) add(e.image, "event", e.id, e.title);
  for (const m of meetups) add(m.coverImageUrl, "meetupGroup", m.id, m.name);
  return byUrl;
}

function validateUniqueImageUrl(url, { kind, id, pathPrefix }, { catalogByUrl, payloadUrlsUsed }) {
  const errors = [];
  const u = String(url || "").trim();
  if (!u) return errors;

  errors.push(...validateBannedImageUrl(u, pathPrefix));

  const owners = catalogByUrl.get(u) || [];
  const otherOwners = owners.filter((o) => !(o.kind === kind && o.id === id));
  if (otherOwners.length > 0) {
    const who = otherOwners.map((o) => `${o.kind} ${o.id}`).join(", ");
    errors.push(`${pathPrefix}: image URL already used by ${who} — upload a unique ImgBB asset`);
  }

  if (payloadUrlsUsed.has(u)) {
    errors.push(`${pathPrefix}: duplicate image URL in this payload (another operation uses the same ImgBB link)`);
  } else {
    payloadUrlsUsed.add(u);
  }

  return errors;
}

function validatePayloadImages(operations, { providers, events, meetups, providersById }) {
  const errors = [];
  const catalogByUrl = buildCatalogImageIndex(providers, events, meetups);
  const payloadUrlsUsed = new Set();

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    if (!op || typeof op !== "object") continue;
    const p = `operations[${i}]`;

    if (op.resource === "provider" && op.action === "upsert") {
      const doc = op.document;
      const id = doc?.id;
      const img = doc?.image;
      if (!img || !String(img).trim()) {
        errors.push(`${p} provider: image required (non-empty https ImgBB URL)`);
      } else {
        errors.push(
          ...validateUniqueImageUrl(img, { kind: "provider", id, pathPrefix: `${p} provider` }, {
            catalogByUrl,
            payloadUrlsUsed,
          }),
        );
      }
    }

    if (op.resource === "provider" && op.action === "patch" && op.patch?.image !== undefined) {
      const img = op.patch.image;
      if (img && String(img).trim()) {
        errors.push(
          ...validateUniqueImageUrl(img, { kind: "provider", id: op.id, pathPrefix: `${p} provider.patch` }, {
            catalogByUrl,
            payloadUrlsUsed,
          }),
        );
      }
    }

    if (op.resource === "meetupGroup" && op.action === "upsert") {
      const doc = op.document;
      const id = doc?.id;
      const img = doc?.coverImageUrl;
      if (!img || !String(img).trim()) {
        errors.push(`${p} meetupGroup: coverImageUrl required (non-empty https ImgBB URL)`);
      } else {
        errors.push(
          ...validateUniqueImageUrl(
            img,
            { kind: "meetupGroup", id, pathPrefix: `${p} meetupGroup` },
            { catalogByUrl, payloadUrlsUsed },
          ),
        );
      }
    }

    if (op.resource === "meetupGroup" && op.action === "patch" && op.patch?.coverImageUrl !== undefined) {
      const img = op.patch.coverImageUrl;
      if (img && String(img).trim()) {
        errors.push(
          ...validateUniqueImageUrl(
            img,
            { kind: "meetupGroup", id: op.id, pathPrefix: `${p} meetupGroup.patch` },
            { catalogByUrl, payloadUrlsUsed },
          ),
        );
      }
    }

    if (op.resource === "event" && op.action === "upsert") {
      const doc = op.document;
      const id = doc?.id;
      const img = doc?.image;
      if (!img || !String(img).trim()) {
        errors.push(`${p} event: image required (non-empty https ImgBB URL)`);
      } else {
        errors.push(
          ...validateUniqueImageUrl(img, { kind: "event", id, pathPrefix: `${p} event` }, {
            catalogByUrl,
            payloadUrlsUsed,
          }),
        );
        const hostId = Array.isArray(doc.venueIds) ? doc.venueIds[0] : undefined;
        const host = hostId && providersById ? providersById.get(hostId) : undefined;
        if (host?.image?.trim() && host.image.trim() === img.trim()) {
          errors.push(
            `${p} event: image must not equal primary host ${hostId} provider.image — use per-show promo from the ticket page`,
          );
        }
      }
    }

    if (op.resource === "event" && op.action === "patch" && op.patch?.image !== undefined) {
      const img = op.patch.image;
      if (img && String(img).trim()) {
        errors.push(
          ...validateUniqueImageUrl(img, { kind: "event", id: op.id, pathPrefix: `${p} event.patch` }, {
            catalogByUrl,
            payloadUrlsUsed,
          }),
        );
      }
    }
  }

  return errors;
}

module.exports = {
  BANNED_IMGBB_HASHES,
  buildCatalogImageIndex,
  validateBannedImageUrl,
  validatePayloadImages,
};
