import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Optional legacy host → canonical (set NEXT_PUBLIC_CANONICAL_HOST=pestiest.hu). */
function maybeCanonicalRedirect(request: NextRequest): NextResponse | null {
  const canonical = process.env.NEXT_PUBLIC_CANONICAL_HOST?.trim();
  if (!canonical) return null;
  const host = request.nextUrl.hostname;
  if (host === canonical) return null;
  const legacyHosts = [
    "budapest-night.vercel.app",
    "www.pestiest.hu",
    process.env.LEGACY_SITE_HOST?.trim(),
  ].filter(Boolean) as string[];
  if (!legacyHosts.includes(host)) return null;
  const url = request.nextUrl.clone();
  url.hostname = canonical;
  url.protocol = "https:";
  return NextResponse.redirect(url, 308);
}

export default function middleware(request: NextRequest) {
  const redirect = maybeCanonicalRedirect(request);
  if (redirect) return redirect;
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(es|it|hu|he|ar)/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
