import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["dotenv"],
  transpilePackages: [
    "@doneisbetter/gds-theme",
    "@doneisbetter/gds-core",
    "@doneisbetter/gds-admin",
  ],
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.modules = [
      path.join(__dirname, "node_modules"),
      ...(Array.isArray(config.resolve.modules)
        ? config.resolve.modules
        : config.resolve.modules
          ? [config.resolve.modules]
          : ["node_modules"]),
    ];
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
