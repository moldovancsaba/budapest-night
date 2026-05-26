import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const mantineAliases = {
  "@mantine/core": path.dirname(require.resolve("@mantine/core/package.json")),
  "@mantine/hooks": path.dirname(require.resolve("@mantine/hooks/package.json")),
  "@mantine/notifications": path.dirname(
    require.resolve("@mantine/notifications/package.json"),
  ),
  "@mantine/modals": path.dirname(require.resolve("@mantine/modals/package.json")),
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["dotenv"],
  transpilePackages: ["@gds/theme", "@gds/core", "@gds/admin"],
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ...mantineAliases,
    };
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co", pathname: "/**" },
      { protocol: "https", hostname: "ibb.co", pathname: "/**" },
      { protocol: "https", hostname: "image.ibb.co", pathname: "/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
