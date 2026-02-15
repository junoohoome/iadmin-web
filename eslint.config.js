import js from "@eslint/js";
import ts from "typescript-eslint";
import eslintPluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default ts.config(
  // 忽略的文件
  {
    ignores: [
      "*.d.ts",
      "**/coverage",
      "**/dist",
      "build/**",
      "src/assets/**",
      "public/**",
    ],
  },

  // JavaScript 推荐配置
  js.configs.recommended,

  // TypeScript 推荐配置
  ...ts.configs.recommended,

  // Vue 推荐配置
  ...eslintPluginVue.configs["flat/recommended"],

  // TypeScript + Vue 文件配置
  {
    files: ["**/*.{ts,tsx,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: ts.parser,
      },
    },
    rules: {
      // TypeScript 相关规则
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",

      // Vue 相关规则
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
    },
  },

  // JavaScript 文件配置
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Prettier 配置（必须放在最后）
  eslintConfigPrettier,

  // Prettier 插件规则
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },
);
