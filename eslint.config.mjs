import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals", 
    "next/typescript"
  ),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Basic rules only
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      "react/display-name": "error",
    },
  },
  {
    // The registry build pipeline is deliberately plain CommonJS: build.js runs
    // under bare `node` with no transform step, and Jest only transforms
    // .ts/.tsx. `require` is the correct form here, not a lapse.
    files: ["registry/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "storybook-static/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "packages/**",
    ],
  },
];

export default eslintConfig;
