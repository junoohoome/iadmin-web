<template>
  <div id="tags-view-container" class="tags-view-container">
    <ScrollPane ref="scrollPane" class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        class="tags-view-item"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <Close
          v-if="!isAffix(tag)"
          class="el-icon-close"
          @click.prevent.stop="closeSelectedTag(tag)"
        />
      </router-link>
    </ScrollPane>
    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
    >
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        关闭
      </li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import {
  useRoute,
  useRouter,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from "vue-router";
import { Close } from "@element-plus/icons-vue";
import { useTagsViewStore, usePermissionStore, type TagView } from "@/stores";
import ScrollPane from "./ScrollPane.vue";

const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();
const permissionStore = usePermissionStore();

const scrollPane = ref<InstanceType<typeof ScrollPane>>();
const tag = ref<HTMLElement[]>([]);

const visible = ref(false);
const top = ref(0);
const left = ref(0);
const selectedTag = ref<TagView>({} as TagView);
const affixTags = ref<TagView[]>([]);

const visitedViews = computed(() => tagsViewStore.visitedViews);
const routes = computed(() => permissionStore.routes);

function isActive(tag: TagView) {
  return tag.path === route.path;
}

function isAffix(tag: TagView) {
  return tag.meta && tag.meta.affix;
}

function filterAffixTags(routes: RouteRecordRaw[], basePath = "/"): TagView[] {
  let tags: TagView[] = [];
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      // 避免双斜杠：如果 basePath 结尾有 / 且 route.path 以 / 开头，只取其一
      const separator = basePath.endsWith("/") || route.path.startsWith("/") ? "" : "/";
      const tagPath = basePath + separator + route.path;
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name as string,
        title: route.meta?.title as string,
        meta: { ...route.meta },
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(
        route.children as RouteRecordRaw[],
        route.path,
      );
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
}

function initTags() {
  affixTags.value = filterAffixTags(routes.value);
  for (const tag of affixTags.value) {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag as unknown as RouteLocationNormalized);
    }
  }
}

function addTags() {
  const { name } = route;
  if (name) {
    tagsViewStore.addView(route);
  }
  return false;
}

function moveToCurrentTag() {
  nextTick(() => {
    for (const tag of tag.value) {
      if ((tag as any).to.path === route.path) {
        scrollPane.value?.moveToTarget(tag as any);
        if ((tag as any).to.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView(route as unknown as TagView);
        }
        break;
      }
    }
  });
}

function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view).then(() => {
    const { fullPath } = view;
    nextTick(() => {
      router.replace({
        path: "/redirect" + fullPath,
      });
    });
  });
}

function closeSelectedTag(view: TagView) {
  tagsViewStore.delView(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view);
    }
  });
}

function closeOthersTags() {
  router.push(selectedTag.value);
  tagsViewStore.delOthersViews(selectedTag.value).then(() => {
    moveToCurrentTag();
  });
}

function closeAllTags(view: TagView) {
  tagsViewStore.delAllViews().then(({ visitedViews }) => {
    if (affixTags.value.some((tag) => tag.path === view.path)) {
      return;
    }
    toLastView(visitedViews, view);
  });
}

function toLastView(visitedViews: TagView[], view: TagView) {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.fullPath);
  } else {
    if (view.name === "Dashboard") {
      router.replace({ path: "/redirect" + view.fullPath });
    } else {
      router.push("/");
    }
  }
}

function openMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 105;
  const offsetLeft = (e.currentTarget as HTMLElement).getBoundingClientRect()
    .left;
  const offsetWidth = (e.currentTarget as HTMLElement).offsetWidth;
  const maxLeft = offsetWidth - menuMinWidth;
  const leftPos = e.clientX - offsetLeft + 15;

  left.value = leftPos > maxLeft ? maxLeft : leftPos;
  top.value = e.clientY;
  visible.value = true;
  selectedTag.value = tag;
}

function closeMenu() {
  visible.value = false;
}

watch(
  () => route,
  () => {
    addTags();
    moveToCurrentTag();
  },
);

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeMenu);
  } else {
    document.body.removeEventListener("click", closeMenu);
  }
});

onMounted(() => {
  initTags();
  addTags();
});
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      text-decoration: none;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;

        &::before {
          content: "";
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;

      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;

      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }

      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
