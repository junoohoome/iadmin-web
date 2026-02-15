<template>
  <div :class="{ show: show }" class="header-search">
    <SvgIcon icon-class="search" @click.stop="click" />
    <el-select
      ref="headerSearchSelect"
      v-model="search"
      :remote-method="querySearch"
      filterable
      default-first-option
      remote
      placeholder="搜索"
      class="header-search-select"
      @change="change"
    >
      <el-option
        v-for="item in options"
        :key="item.item.path"
        :value="item.item"
        :label="item.item.title.join(' > ')"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import Fuse from "fuse.js";
import { useRouter } from "vue-router";
import { usePermissionStore } from "@/stores";
import type { RouteRecordRaw } from "vue-router";

// Simple path resolution function for route paths
function resolvePath(basePath: string, relativePath: string): string {
  if (relativePath.startsWith("/")) {
    return relativePath;
  }
  const base = basePath.endsWith("/") ? basePath : basePath + "/";
  const rel = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;
  return base + rel;
}

// Type for search result items
interface SearchResultItem {
  path: string;
  title: string[];
}

const router = useRouter();
const permissionStore = usePermissionStore();

const search = ref("");
const options = ref<Fuse.FuseResult<SearchResultItem>[]>([]);
const searchPool = ref<SearchResultItem[]>([]);
const show = ref(false);
const fuse = ref<Fuse<SearchResultItem> | undefined>(undefined);
const headerSearchSelect = ref();

const routes = computed(() => permissionStore.allRoutes);

// 监听 routes 变化时更新 searchPool
watch(
  routes,
  (newRoutes) => {
    if (newRoutes && newRoutes.length > 0) {
      searchPool.value = generateRoutes(newRoutes);
      initFuse(searchPool.value);
    }
  },
  { immediate: true },
);

watch(show, (value) => {
  if (value) {
    document.body.addEventListener("click", close);
  } else {
    document.body.removeEventListener("click", close);
  }
});

onMounted(() => {
  searchPool.value = generateRoutes(routes.value);
});

function click() {
  show.value = !show.value;
  if (show.value) {
    headerSearchSelect.value?.focus();
  }
}

function close() {
  headerSearchSelect.value?.blur();
  options.value = [];
  show.value = false;
}

function change(val: SearchResultItem) {
  router.push(val.path);
  search.value = "";
  options.value = [];
  nextTick(() => {
    show.value = false;
  });
}

function initFuse(list: SearchResultItem[]) {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    minMatchCharLength: 1,
    keys: [
      {
        name: "title",
        weight: 0.7,
      },
      {
        name: "path",
        weight: 0.3,
      },
    ],
  });
}

function generateRoutes(
  routes: RouteRecordRaw[],
  basePath = "/",
  prefixTitle: string[] = [],
): SearchResultItem[] {
  let res: SearchResultItem[] = [];

  for (const router of routes) {
    if (router.meta?.hidden) {
      continue;
    }

    const data: SearchResultItem = {
      path: resolvePath(basePath, router.path),
      title: [...prefixTitle],
    };

    if (router.meta && router.meta.title) {
      data.title = [...data.title, router.meta.title as string];

      if (router.redirect !== "noRedirect") {
        res.push(data);
      }
    }

    if (router.children) {
      const tempRoutes = generateRoutes(
        router.children as RouteRecordRaw[],
        data.path,
        data.title,
      );
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes];
      }
    }
  }
  return res;
}

function querySearch(query: string) {
  if (query !== "") {
    options.value = fuse.value?.search(query) || [];
  } else {
    options.value = [];
  }
}
</script>

<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;

  .svg-icon {
    font-size: 18px;
    cursor: pointer;
  }

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-search-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    :deep(.el-input__inner) {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>
