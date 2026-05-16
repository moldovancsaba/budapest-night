import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(es|it|hu|he|ar)/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
