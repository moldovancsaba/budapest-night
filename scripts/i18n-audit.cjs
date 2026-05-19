#!/usr/bin/env node
/**
 * Translation audit: locale file parity + keys referenced in src/.
 * Run: node scripts/i18n-audit.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LOCALES = ["en", "hu", "es", "it", "he", "ar"];
const SRC = path.join(ROOT, "src");

function flatten(obj, prefix = "") {
  const out = new Map();
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    if (prefix) out.set(prefix, obj);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      for (const [sk, sv] of flatten(v, key)) out.set(sk, sv);
    } else {
      out.set(key, v);
    }
  }
  return out;
}

function loadJson(rel) {
  const fp = path.join(ROOT, rel);
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

function walkDir(dir, ext, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      if (name !== "node_modules" && name !== ".next") walkDir(fp, ext, files);
    } else if (ext.some((e) => name.endsWith(e))) files.push(fp);
  }
  return files;
}

/** @type {Map<string, Set<string>>} */
const usedKeys = new Map();

function addUsed(namespace, key) {
  if (!namespace || !key) return;
  const full = `${namespace}.${key}`;
  if (!usedKeys.has(namespace)) usedKeys.set(namespace, new Set());
  usedKeys.get(namespace).add(key);
  usedKeys.get(namespace).add(full);
}

function scanSource() {
  const files = walkDir(SRC, [".ts", ".tsx"]);
  const bindRe =
    /const\s+(\w+)\s*=\s*useTranslations\(\s*["'`]([^"'`]+)["'`]\s*\)/g;

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    /** @type {{ varName: string; ns: string; index: number }[]} */
    const bindings = [];
    let m;
    while ((m = bindRe.exec(text))) {
      bindings.push({ varName: m[1], ns: m[2], index: m.index });
    }
    if (!bindings.length) continue;

    const boundVars = [...new Set(bindings.map((b) => b.varName))];
    const callRe = new RegExp(
      `\\b(${boundVars.join("|")})\\(\\s*["'\`]([a-zA-Z0-9_.]+)["'\`]`,
      "g",
    );
    while ((m = callRe.exec(text))) {
      const varName = m[1];
      const key = m[2];
      const callIndex = m.index;
      let ns = null;
      for (let i = bindings.length - 1; i >= 0; i--) {
        const b = bindings[i];
        if (b.index > callIndex) continue;
        if (b.varName === varName) {
          ns = b.ns;
          break;
        }
      }
      if (ns) addUsed(ns, key);
    }

    for (const varName of boundVars) {
      const dynRe = new RegExp(
        `\\b${varName}\\(\\s*\`([a-zA-Z0-9_]+)\\.\\$\\{`,
        "g",
      );
      while ((m = dynRe.exec(text))) {
        const callIndex = m.index;
        let ns = null;
        for (let i = bindings.length - 1; i >= 0; i--) {
          const b = bindings[i];
          if (b.index > callIndex) continue;
          if (b.varName === varName) {
            ns = b.ns;
            break;
          }
        }
        if (ns) addUsed(ns, `${m[1]}.*`);
      }
    }
  }
}

function loadMergedLocale(locale) {
  const main = loadJson(`src/messages/${locale}.json`);
  if (locale === "en") return main;
  const en = loadJson("src/messages/en.json");
  const merged = JSON.parse(JSON.stringify(main));
  function mergeMessages(localeObj, fallback) {
    const out = { ...localeObj };
    for (const key of Object.keys(fallback)) {
      const lv = localeObj[key];
      const fv = fallback[key];
      if (lv === undefined) out[key] = fv;
      else if (
        lv !== null &&
        fv !== null &&
        typeof lv === "object" &&
        typeof fv === "object" &&
        !Array.isArray(lv) &&
        !Array.isArray(fv)
      ) {
        out[key] = mergeMessages(lv, fv);
      }
    }
    return out;
  }
  return mergeMessages(merged, en);
}

function main() {
  scanSource();

  const enFlat = flatten(loadJson("src/messages/en.json"));
  const localeFlats = {};
  for (const loc of LOCALES) {
    localeFlats[loc] = flatten(loadMergedLocale(loc));
  }

  console.log("=== Budapest Night i18n audit ===\n");

  // 1. Locale parity vs en (raw files, not merged)
  console.log("## 1. Keys missing in locale files (before EN fallback)\n");
  let parityIssues = 0;
  for (const loc of LOCALES) {
    if (loc === "en") continue;
    const raw = flatten(loadJson(`src/messages/${loc}.json`));
    const missing = [];
    for (const key of enFlat.keys()) {
      if (!raw.has(key)) missing.push(key);
    }
    if (missing.length) {
      parityIssues += missing.length;
      console.log(`### ${loc}.json — ${missing.length} missing (filled from en at runtime)`);
      for (const k of missing.slice(0, 40)) console.log(`  - ${k}`);
      if (missing.length > 40) console.log(`  … and ${missing.length - 40} more`);
      console.log();
    }
  }
  if (!parityIssues) console.log("(none — all locales define every en key)\n");

  // 2. Extra keys not in en
  console.log("## 2. Keys in locale files but not in en.json\n");
  let extraIssues = 0;
  for (const loc of LOCALES) {
    if (loc === "en") continue;
    const raw = flatten(loadJson(`src/messages/${loc}.json`));
    const extra = [];
    for (const key of raw.keys()) {
      if (!enFlat.has(key)) extra.push(key);
    }
    if (extra.length) {
      extraIssues += extra.length;
      console.log(`### ${loc}.json — ${extra.length} extra`);
      for (const k of extra.slice(0, 20)) console.log(`  - ${k}`);
      if (extra.length > 20) console.log(`  … and ${extra.length - 20} more`);
      console.log();
    }
  }
  if (!extraIssues) console.log("(none)\n");

  // 3. Empty values
  console.log("## 3. Empty translation values (en.json)\n");
  const emptyEn = [...enFlat.entries()].filter(([, v]) => v === "");
  if (emptyEn.length) {
    for (const [k] of emptyEn) console.log(`  - ${k}`);
  } else {
    console.log("(none)\n");
  }

  // 4. Code references missing from merged messages
  console.log("## 4. Keys used in src/ but missing from messages (post-merge)\n");
  const mergedEn = flatten(loadMergedLocale("en"));
  const missingInMessages = [];
  const badNamespaces = [];

  for (const [ns, keys] of usedKeys) {
    if (!mergedEn.has(ns) && !loadJson("src/messages/en.json")[ns]) {
      badNamespaces.push(ns);
    }
    for (const key of keys) {
      if (key.includes(".*")) continue;
      if (key.startsWith(`${ns}.`)) continue;
      const full = `${ns}.${key}`;
      if (!mergedEn.has(full)) {
        missingInMessages.push(full);
      }
    }
  }

  if (badNamespaces.length) {
    console.log("### Invalid namespaces (no message bundle):");
    for (const ns of [...new Set(badNamespaces)].sort()) console.log(`  - ${ns}`);
    console.log();
  }

  if (missingInMessages.length) {
    const uniq = [...new Set(missingInMessages)].sort();
    console.log(`### ${uniq.length} missing key(s):`);
    for (const k of uniq) console.log(`  - ${k}`);
    console.log();
  } else {
    console.log("(none — all referenced keys resolve)\n");
  }

  // 5. Account locale files
  console.log("## 5. account-*.json structure\n");
  const accountEn = flatten(loadJson("src/messages/account-en.json"));
  for (const loc of LOCALES) {
    if (loc === "en") continue;
    const acc = flatten(loadJson(`src/messages/account-${loc}.json`));
    const missing = [...accountEn.keys()].filter((k) => !acc.has(k));
    if (missing.length) {
      console.log(`account-${loc}.json: ${missing.length} missing vs account-en`);
      for (const k of missing.slice(0, 15)) console.log(`  - ${k}`);
      if (missing.length > 15) console.log(`  … +${missing.length - 15}`);
    }
  }
  console.log();

  // Summary
  const codeMissing = [...new Set(missingInMessages)].length;
  // Exit non-zero only on locale parity / invalid namespaces (code scan has known false positives when multiple hooks reuse `t`).
  const exitCode = parityIssues || badNamespaces.length ? 1 : 0;
  console.log("---");
  console.log(
    `Summary: ${parityIssues} raw parity gap(s), ${codeMissing} code key gap(s), ${badNamespaces.length} bad namespace(s)`,
  );
  process.exit(exitCode);
}

main();
