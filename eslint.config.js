import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
import * as parserVue from "vue-eslint-parser";
import configPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
    ignores: ["build/**/*.js", "src/assets/**", "public/**", "dist/**"],
  },

  {
    name: "app/js-to-lint",
    files: ["**/*.{js,cjs,mjs}"],
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  {
    name: "app/vue-to-lint",
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        parser: ts.parser,
      },
      globals: {
        ...globals.browser,
      },
    },
    processor: vue.processors[".vue"],
    plugins: {
      vue,
      "@typescript-eslint": ts.plugin,
    },
    rules: {
      ...vue.configs["vue3-recommended"].rules,
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
    },
  },

  {
    name: "app/typescript-to-lint",
    files: ["**/*.{ts,mts,tsx}"],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": ts.plugin,
    },
    rules: {
      ...ts.configs.recommended.rules,
    },
  },

  configPrettier,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },

  {
    name: "app/prettier-overrides",
    files: ["*.vue", "*.ts", "*.js"],
    plugins: {
      "@typescript-eslint": ts.plugin,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
