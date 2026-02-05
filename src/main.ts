import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";
import permission from "@/directive/permission";

// Element Plus 完整导入
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

import "@/styles/index.scss"; // global css
import "@/icons"; // icon
import "@/permission"; // permission control

const app = createApp(App);

// 创建 pinia 实例
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(ElementPlus);

// Register global directives
app.directive("permission", permission);

app.mount("#app");
