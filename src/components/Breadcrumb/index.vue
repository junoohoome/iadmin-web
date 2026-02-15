<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="
            item.redirect === 'noRedirect' || index === levelList.length - 1
          "
          class="no-redirect"
        >
          {{ item.meta?.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta?.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter, type RouteLocationMatched } from "vue-router";
import { compile } from "path-to-regexp";

const route = useRoute();
const router = useRouter();

interface BreadcrumbItem extends RouteLocationMatched {
  redirect?: string;
}

const levelList = ref<BreadcrumbItem[]>([]);

function getBreadcrumb() {
  let matched = route.matched.filter((item) => item.meta && item.meta.title);
  const first = matched[0];

  if (!isDashboard(first)) {
    matched = [
      { path: "/index", meta: { title: "首页" } } as RouteLocationMatched,
    ].concat(matched);
  }

  levelList.value = matched.filter(
    (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false,
  ) as BreadcrumbItem[];
}

function isDashboard(routeItem?: RouteLocationMatched) {
  const name = routeItem && routeItem.name;
  if (!name) {
    return false;
  }
  return name.toString().trim() === "首页";
}

function pathCompile(path: string) {
  const { params } = route;
  const toPath = compile(path);
  return toPath(params);
}

function handleLink(item: BreadcrumbItem) {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect);
    return;
  }
  router.push(pathCompile(path));
}

watch(
  () => route.path,
  (path) => {
    if (path.startsWith("/redirect/")) {
      return;
    }
    getBreadcrumb();
  },
  { flush: 'post' }
);

onMounted(() => {
  getBreadcrumb();
});
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
