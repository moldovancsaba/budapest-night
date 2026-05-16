/** Fill missing keys from fallback (e.g. English) without overwriting locale-specific strings. */
export function mergeMessages<T extends Record<string, unknown>>(
  locale: T,
  fallback: T,
): T {
  const out = { ...locale } as Record<string, unknown>;
  for (const key of Object.keys(fallback)) {
    const lv = locale[key];
    const fv = fallback[key];
    if (lv === undefined) {
      out[key] = fv;
    } else if (
      lv !== null &&
      fv !== null &&
      typeof lv === "object" &&
      typeof fv === "object" &&
      !Array.isArray(lv) &&
      !Array.isArray(fv)
    ) {
      out[key] = mergeMessages(
        lv as Record<string, unknown>,
        fv as Record<string, unknown>,
      );
    }
  }
  return out as T;
}
