<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <Sidebar class="sidebar-container" />
    <div :class="{ hasTagsView: tagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <Navbar />
        <TagsView v-if="tagsView" />
      </div>
      <AppMain />
      <RightPanel>
        <Settings />
      </RightPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore, useSettingsStore } from "@/stores";
import Sidebar from "./components/Sidebar/index.vue";
import AppMain from "./components/AppMain.vue";
import Navbar from "./components/Navbar.vue";
import Settings from "./components/Settings/index.vue";
import TagsView from "./components/TagsView/index.vue";
import RightPanel from "@/components/RightPanel/index.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();

// 使用 storeToRefs 避免不必要的响应式更新
const { sidebar, device } = storeToRefs(appStore);
const { showSettings, tagsView, fixedHeader } = storeToRefs(settingsStore);

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === "mobile",
}));

const handleClickOutside = () => {
  appStore.closeSideBar({ withoutAnimation: false });
};
</script>

<style lang="scss" scoped>
@use "@/styles/mixin.scss" as *;
@use "@/styles/variables.scss" as *;

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
</style>
