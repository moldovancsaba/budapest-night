#!/usr/bin/env node
/** @deprecated Use scripts/catalog-content-audit.cjs — forwards for compatibility. */
require("child_process").execSync(`node "${__dirname}/catalog-content-audit.cjs" ${process.argv.slice(2).join(" ")}`, {
  stdio: "inherit",
});
