import registry from "@/data/budapest-location-registry.json";
import { BOROUGHS, NEIGHBORHOODS } from "@/data/locations";

export type ResolvedRegistryLocation = {
  borough: string;
  neighborhood: string;
  address: string;
  source: string;
  kerulet?: string;
  keruletName?: string;
};

export function extractPostalCode(address: string): string {
  const m = String(address || "").match(/\b(1\d{3})\s+Budapest/i);
  return m ? m[1] : "";
}

export function normalizeAddressKey(address: string): string {
  return String(address || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const landmarkById = new Map(registry.landmarks.map((l) => [l.id, l]));
const landmarkByAddress = new Map(
  registry.landmarks.map((l) => [normalizeAddressKey(l.address), l]),
);

const addressOverrides = registry.addressOverrides.map((o) => ({
  ...o,
  re: new RegExp(o.pattern, "i"),
}));

/** Registry-only resolution — no marketing inference. */
export function resolveLocationFromRegistry(input: {
  id?: string;
  address?: string;
  borough?: string;
  neighborhood?: string;
}): ResolvedRegistryLocation | { error: string } {
  const address = String(input.address || "").trim();
  const postal = extractPostalCode(address);

  if (input.id && landmarkById.has(input.id)) {
    const l = landmarkById.get(input.id)!;
    const row = registry.postalToAppBorough[extractPostalCode(l.address) as keyof typeof registry.postalToAppBorough];
    return {
      borough: l.borough,
      neighborhood: l.neighborhood,
      address: l.address,
      source: `landmark:${input.id}`,
      kerulet: row?.kerulet,
      keruletName: row?.keruletName,
    };
  }

  const addrKey = normalizeAddressKey(address);
  if (addrKey && landmarkByAddress.has(addrKey)) {
    const l = landmarkByAddress.get(addrKey)!;
    const row = registry.postalToAppBorough[extractPostalCode(l.address) as keyof typeof registry.postalToAppBorough];
    return {
      borough: l.borough,
      neighborhood: l.neighborhood,
      address: l.address,
      source: "landmark:address",
      kerulet: row?.kerulet,
      keruletName: row?.keruletName,
    };
  }

  for (const o of addressOverrides) {
    if (o.re.test(address)) {
      const row = postal
        ? registry.postalToAppBorough[postal as keyof typeof registry.postalToAppBorough]
        : undefined;
      return {
        borough: o.borough,
        neighborhood: o.neighborhood,
        address,
        source: `addressOverride:${o.pattern}`,
        kerulet: row?.kerulet,
        keruletName: row?.keruletName,
      };
    }
  }

  if (postal) {
    const row = registry.postalToAppBorough[postal as keyof typeof registry.postalToAppBorough];
    if (row) {
      return {
        borough: row.appBorough,
        neighborhood: input.neighborhood || "",
        address,
        source: `postal:${postal}`,
        kerulet: row.kerulet,
        keruletName: row.keruletName,
      };
    }
    return {
      error: `postal ${postal} not in src/data/budapest-location-registry.json — register before ingest`,
    };
  }

  return { error: 'address must match: {postal} Budapest, {street}, Hungary' };
}

export function neighborhoodAllowed(borough: string, neighborhood: string): boolean {
  const list = NEIGHBORHOODS[borough as keyof typeof NEIGHBORHOODS];
  return Boolean(list?.includes(neighborhood));
}

function collectText(doc: {
  shortDescription?: string;
  longDescription?: string;
  locales?: Record<string, { shortDescription?: string; longDescription?: string }>;
}): string[] {
  const out: string[] = [];
  if (doc.shortDescription) out.push(doc.shortDescription);
  if (doc.longDescription) out.push(doc.longDescription);
  for (const loc of Object.values(doc.locales || {})) {
    if (loc?.shortDescription) out.push(loc.shortDescription);
    if (loc?.longDescription) out.push(loc.longDescription);
  }
  return out;
}

/** Blocking validation for API / curator paths. */
export function validateProviderLocationForIngest(
  doc: {
    id?: string;
    borough?: string;
    neighborhood?: string;
    address?: string;
    shortDescription?: string;
    longDescription?: string;
    locales?: Record<string, { shortDescription?: string; longDescription?: string }>;
  },
  pathPrefix: string,
): string[] {
  const errors: string[] = [];
  const p = pathPrefix || "provider";
  const address = doc.address?.trim() ?? "";
  if (!address) {
    errors.push(`${p}.address: required`);
    return errors;
  }

  const postal = extractPostalCode(address);
  if (!postal) {
    errors.push(`${p}.address: must include 4-digit postal + Budapest`);
    return errors;
  }

  if (!registry.postalToAppBorough[postal as keyof typeof registry.postalToAppBorough]) {
    errors.push(`${p}.address: postal ${postal} not in budapest-location-registry.json`);
    return errors;
  }

  const resolved = resolveLocationFromRegistry(doc);
  if ("error" in resolved) {
    errors.push(`${p}: ${resolved.error}`);
    return errors;
  }

  if (doc.borough !== resolved.borough) {
    errors.push(
      `${p}.borough: must be ${resolved.borough} (registry ${resolved.source}; postal ${postal} → Budapest ${resolved.kerulet}. ker.)`,
    );
  }

  if (resolved.source.startsWith("landmark") || resolved.source.startsWith("addressOverride")) {
    if (doc.neighborhood !== resolved.neighborhood) {
      errors.push(`${p}.neighborhood: must be ${resolved.neighborhood} (${resolved.source})`);
    }
  } else if (doc.borough && doc.neighborhood && !neighborhoodAllowed(doc.borough, doc.neighborhood)) {
    errors.push(`${p}.neighborhood: not in allow-list for ${doc.borough} (src/data/locations.ts)`);
  }

  for (const rule of registry.forbiddenPairings) {
    if (!new RegExp(rule.addressPattern, "i").test(address)) continue;
    if (rule.forbiddenNeighborhood && doc.neighborhood === rule.forbiddenNeighborhood) {
      errors.push(`${p}: ${rule.reason}`);
    }
    if (rule.forbiddenBorough && doc.borough === rule.forbiddenBorough) {
      errors.push(`${p}: ${rule.reason}`);
    }
  }

  const copy = collectText(doc).join("\n");
  for (const rule of registry.forbiddenCopyPatterns) {
    if (!new RegExp(rule.whenAddressPattern, "i").test(address)) continue;
    if (new RegExp(rule.pattern, "i").test(copy)) errors.push(`${p}: copy — ${rule.reason}`);
  }

  return errors;
}

/** Prompt block — keep in sync with scripts/cursor-curator-location-rules.txt */
export function getLocationIngestRulesForPrompt(): string {
  const landmarkExamples = registry.landmarks
    .slice(0, 6)
    .map((l) => `  - ${l.id}: ${l.borough} / ${l.neighborhood} — ${l.address}`)
    .join("\n");

  return `## Location (blocking — registry only)

Source of truth: **src/data/budapest-location-registry.json** + neighborhoods in **src/data/locations.ts**.
Full curator checklist: **scripts/cursor-curator-location-rules.txt**.

### Rules (no exceptions)
1. **Address format:** \`{postal} Budapest, {street}, Hungary\` (e.g. \`1124 Budapest, Csörsz utca 18, Hungary\`).
2. **borough** must match registry resolution order:
   - landmark by \`id\` → landmark by normalized address → \`addressOverrides\` street pattern → \`postalToAppBorough[postal]\`.
3. **neighborhood** must be an exact string from \`src/data/locations.ts\` for that borough.
4. **Never** set district from: marketing copy, \`prov-*\` id suffix, coverage \`gapKey\`, or guesswork.
5. **Register unknown postals** in \`budapest-location-registry.json\` before ingest — dry-run **rejects** unlisted postals.
6. **Official kerület vs app borough:** e.g. postal **1124** = Budapest **XII. Hegyvidék** → app bucket **Buda**, neighborhood **MOM Park** (not Újbuda / Infopark, not Ferencváros).

### Verified landmarks (sample — see JSON for full list)
${landmarkExamples}

### Common failures (reject ingest)
- Csörsz utca 18 / 1124 labeled **Infopark** or **Újbuda** (Infopark is 1117, different place).
- Budapest Park / Fábián Juli labeled **Óbuda Island**.
- MVM Dome / Stefánia utca labeled **Újbuda** or **Kelenföld**.
- Petőfi rakpart ship (A38) labeled **Újbuda** only because postal is 1117 — use **Ferencváros / Petőfi Bridge**.

### App boroughs (enum)
${BOROUGHS.join(", ")}

### After writing payload
\`\`\`bash
npm run audit:locations -- --dry-run scripts/ingest-payloads/your-file.json
# or
npm run ingest:listing -- --dry-run scripts/ingest-payloads/your-file.json
\`\`\``;
}
