import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Next 16's `eslint-config-next` ships native ESLint flat-config arrays
 * (see node_modules/eslint-config-next/dist/index.js) — the legacy
 * `FlatCompat` shim is for pre-flat-config plugins and actively breaks on
 * this package with ESLint 9, so it's intentionally not used here.
 */
const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/jsx-boolean-value": ["error", "never"],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "prisma/migrations/**",
    ],
  },
];

export default eslintConfig;
