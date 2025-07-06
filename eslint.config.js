// @ts-check

import pluginBoundaries from "eslint-plugin-boundaries";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  ignores: ["dist", "node_modules", "coverage"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.node,
    },
  },
  plugins: {
    react: pluginReact,
    import: pluginImport,
    boundaries: pluginBoundaries,
  },
  rules: {
    ...pluginReact.configs.recommended.rules,
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "@**",
            group: "internal",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-relative-parent-imports": "error",
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: ["src/core/**"], allow: ["src/core/**"] },
          { from: ["src/**/controllers/**", "src/**/hooks/**", "src/**/stores/**"], allow: ["src/core/**"] },
          { from: ["src/**/components/**"], allow: ["src/**/controllers/**", "src/**/hooks/**", "src/core/**"] },
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
    react: {
      version: "detect",
    },
    "boundaries/elements": [
      { type: "core", pattern: "src/core/**" },
      { type: "controllers", pattern: "src/**/controllers/**" },
      { type: "hooks", pattern: "src/**/hooks/**" },
      { type: "stores", pattern: "src/**/stores/**" },
      { type: "components", pattern: "src/**/components/**" },
    ],
  },
  overrides: [
    {
      files: ["src/core/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              { name: "react", message: "Layer 1(core) cannot import React" },
              { name: "zustand", message: "Layer 1(core) cannot import Zustand" },
              { name: "@react-three/fiber", message: "Layer 1(core) cannot import React Three Fiber" },
            ],
          },
        ],
      },
    },
  ],
}); 