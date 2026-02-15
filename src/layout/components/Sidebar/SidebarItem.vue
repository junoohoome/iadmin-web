<template>
  <div v-if="!isHidden" class="menu-wrapper">
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <AppLink v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <Item
            :icon="onlyOneChild.meta.icon || (item.meta && item.meta.icon)"
            :title="onlyOneChild.meta.title"
          />
        </el-menu-item>
      </AppLink>
    </template>

    <el-submenu
      v-else
      ref="subMenu"
      :index="resolvePath(item.path)"
      popper-append-to-body
    >
      <template #title>
        <Item
          v-if="item.meta"
          :icon="item.meta && item.meta.icon"
          :title="item.meta.title"
        />
      </template>
      <SidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from "vue";
import { ElMenuItem, ElSubMenu } from "element-plus";
import { isExternal } from "@/utils/validate";
import Item from "./Item.vue";
import AppLink from "./Link.vue";

interface RouteConfig {
  path: string;
  meta?: {
    title?: string;
    icon?: string;
    activeMenu?: string;
    affix?: boolean;
    noCache?: boolean;
    hidden?: boolean;
  };
  children?: RouteConfig[];
  alwaysShow?: boolean;
  hidden?: boolean;
  noShowingChildren?: boolean;
}

const props = defineProps({
  item: {
    type: Object as PropType<RouteConfig>,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
  basePath: {
    type: String,
    default: "",
  },
});

const onlyOneChild = ref<RouteConfig | null>(null);

// 检查路由是否隐藏（兼容 hidden 和 meta.hidden）
const isHidden = computed(() => {
  return props.item.hidden || props.item.meta?.hidden;
});

function hasOneShowingChild(children: RouteConfig[] = [], parent: RouteConfig) {
  const showingChildren = children.filter((item) => {
    const isItemHidden = item.hidden || item.meta?.hidden;
    if (isItemHidden) {
      return false;
    } else {
      onlyOneChild.value = item;
      return true;
    }
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }

  return false;
}

function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  const fullPath = props.basePath
    ? props.basePath.replace(/\/$/, "") + "/" + routePath.replace(/^\//, "")
    : routePath;
  return fullPath;
}
</script>
