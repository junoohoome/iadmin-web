<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div>
      <SvgIcon icon-class="size" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item of sizeOptions"
          :key="item.value"
          :disabled="size === item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useAppStore } from "@/stores";
import { useTagsViewStore } from "@/stores";
import { useRoute, useRouter } from "vue-router";

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const route = useRoute();
const router = useRouter();

const sizeOptions = [
  { label: "Default", value: "default" },
  { label: "Medium", value: "medium" },
  { label: "Small", value: "small" },
  { label: "Mini", value: "mini" },
];

const size = computed(() => appStore.size);

function handleSetSize(newSize: string) {
  appStore.setSize(newSize);
  refreshView();
  ElMessage.success("切换布局大小成功");
}

function refreshView() {
  tagsViewStore.delAllCachedViews(route);
  nextTick(() => {
    const { fullPath } = route;
    router.replace({
      path: "/redirect" + fullPath,
    });
  });
}
</script>
