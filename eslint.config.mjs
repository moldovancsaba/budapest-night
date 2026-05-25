import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { createGdsConfig } from "@gds/eslint-config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "next-env.d.ts",
      "src/components/gds/icons.ts",
      "src/app/api/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...createGdsConfig({ allowedImports: [] }),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message: "Use @/components/gds/icons or GdsIcons from @gds/core.",
            },
          ],
          patterns: [
            {
              group: ["@/components/ui/*", "@/components/ui", "@/components/mantine/*"],
              message: "Use @gds/* packages and @/components/gds/* adapters only.",
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
