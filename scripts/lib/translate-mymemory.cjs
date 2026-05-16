/**
 * Free MyMemory machine translation (no API key). Rate-limit friendly.
 */
const BASE = "https://api.mymemory.translated.net/get";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateOnce(text, from, to) {
  const q = String(text || "").trim();
  if (!q) return "";
  const url = `${BASE}?q=${encodeURIComponent(q)}&langpair=${from}|${to}`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.responseStatus !== 200 || !j.responseData?.translatedText) {
    throw new Error(j.responseDetails || `MyMemory ${r.status}`);
  }
  return j.responseData.translatedText.trim();
}

/**
 * @param {string} text
 * @param {string} from e.g. en
 * @param {string} to e.g. hu
 * @param {{ delayMs?: number, retries?: number }} opts
 */
async function translateText(text, from, to, opts = {}) {
  const delayMs = opts.delayMs ?? 350;
  const retries = opts.retries ?? 3;
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const out = await translateOnce(text, from, to);
      await sleep(delayMs);
      return out;
    } catch (e) {
      lastErr = e;
      await sleep(delayMs * (i + 2));
    }
  }
  throw lastErr;
}

module.exports = { translateText, sleep };
