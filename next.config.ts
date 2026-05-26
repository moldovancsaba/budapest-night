import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function resolveMantinePackage(name: string) {
  return path.dirname(require.resolve(name));
}

const mantineAliases = {
  "@mantine/core": resolveMantinePackage("@mantine/core"),
  "@mantine/hooks": resolveMantinePackage("@mantine/hooks"),
  "@mantine/notifications": resolveMantinePackage("@mantine/notifications"),
  "@mantine/modals": resolveMantinePackage("@mantine/modals"),
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
