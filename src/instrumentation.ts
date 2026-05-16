import path from "path";

/**
 * Ensures `.env` / `.env.local` from the project root are applied on the Node
 * server runtime. Next.js usually loads these automatically, but some hosts or
 * working directories can skip them; this keeps ADMIN_PASSWORD and other
 * server secrets available to Route Handlers. Prefer `.env.local` for secrets
 * (e.g. from `npm run env:generate`).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { config } = await import("dotenv");
  const root = process.cwd();
  config({ path: path.join(root, ".env") });
  config({ path: path.join(root, ".env.local"), override: true });
}
