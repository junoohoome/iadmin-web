import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

/**
 * 验证必需的环境变量
 */
function validateEnv(env: Record<string, string>, mode: string): void {
  const requiredVars = [
    "VITE_APP_TITLE",
    "VITE_APP_VERSION",
    "VITE_APP_BASE_API",
  ];

  const missing: string[] = [];
  for (const varName of requiredVars) {
    if (!env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for mode "${mode}": ${missing.join(", ")}.\n` +
        `Please check your .env.${mode} file.`,
    );
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // 验证环境变量
  validateEnv(env, mode);

  return {
    plugins: [
      vue(),
      // 自动导入 Vue API
      AutoImport({
        imports: ["vue", "vue-router", "pinia", "@vueuse/core"],
        dts: "src/auto-imports.d.ts",
        eslintrc: {
          enabled: true,
          filepath: "./.eslintrc-auto-import.json",
        },
      }),
      // 自动导入组件 (Element Plus)
      Components({
        resolvers: [
          ElementPlusResolver()
        ],
        dts: "src/components.d.ts",
      }),
      // SVG 图标插件
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), "src/icons/svg")],
        symbolId: "icon-[name]",
        inject: "body-last",
        customDomId: "__svg__icons__dom__",
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/dev-api": {
          target: "http://127.0.0.1:8090",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ""),
        },
      },
    },
    build: {
      target: "es2020",
      outDir: "dist",
      assetsDir: "static",
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            "vue-vendor": ["vue", "vue-router", "pinia"],
            "element-plus": ["element-plus", "@element-plus/icons-vue"],
            echarts: ["echarts"],
            utils: ["axios", "js-cookie", "nprogress", "@vueuse/core"],
          },
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    define: {
      __APP_INFO__: JSON.stringify({
        pkg: {
          name: env.VITE_APP_TITLE,
          version: env.VITE_APP_VERSION,
        },
        lastBuildTime: new Date().toLocaleString(),
      }),
    },
  };
});
