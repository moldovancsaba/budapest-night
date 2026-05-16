/** Mirror English provider copy into required ingest locales (hu, es, it, he, ar). */
const CODES = ["hu", "es", "it", "he", "ar"];

function slugBaseFromId(id) {
  return String(id || "")
    .replace(/^prov-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildProviderLocales(doc) {
  const base = slugBaseFromId(doc.id);
  const long =
    typeof doc.longDescription === "string" && doc.longDescription.includes("Sources:")
      ? doc.longDescription
      : `${doc.longDescription || ""}\n\nSources: ${doc.website || "https://budapest-night.vercel.app"}`;

  const locales = {};
  for (const code of CODES) {
    locales[code] = {
      name: doc.name,
      shortDescription: doc.shortDescription,
      longDescription: long,
      slug: `${base}-${code}`.slice(0, 60),
    };
  }
  return locales;
}

module.exports = { buildProviderLocales };
