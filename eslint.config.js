// @ts-check

import pluginBoundaries from "eslint-plugin-boundaries";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/public/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
    ],
  },
  ...tseslint.configs.recommended,
  {
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
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            // react-three-fiber props
            "args",
            "attach",
            "castShadow",
            "emissive",
            "emissiveIntensity",
            "envMapIntensity",
            "frustumCulled",
            "geometry",
            "index",
            "intensity",
            "map",
            "material",
            "object",
            "position",
            "receiveShadow",
            "renderOrder",
            "rotation",
            "roughness",
            "shadow-camera-bottom",
            "shadow-camera-far",
            "shadow-camera-left",
            "shadow-camera-near",
            "shadow-camera-right",
            "shadow-camera-top",
            "shadow-mapSize",
            "shadow-normalBias",
            "side",
            "transmission",
            "transparent",
            "userData",
            "visible",
          ],
        },
      ],
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
      "import/no-relative-parent-imports": "off",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: ["core"], allow: ["core"] },
            { from: ["controllers"], allow: ["core"] },
            { from: ["hooks"], allow: ["core"] },
            { from: ["stores"], allow: ["core"] },
            { from: ["components"], allow: ["controllers", "hooks", "core"] },
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
  },
  {
    files: ["src/core/**/core/**/*.{ts,tsx}"],
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
);