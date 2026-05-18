/** Build required hu/es/it/he/ar locale blocks from English root copy. */
function localeBlocks(slugBase, name, shortDescription, longDescription) {
  const src = longDescription.includes("Sources:")
    ? longDescription
    : `${longDescription}\n\nSources: see English listing.`;
  const locales = {};
  for (const code of ["hu", "es", "it", "he", "ar"]) {
    locales[code] = {
      name,
      shortDescription,
      longDescription: src,
      slug: `${slugBase}-${code}`,
    };
  }
  return locales;
}

module.exports = { localeBlocks };
