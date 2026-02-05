<template>
  <el-color-picker
    v-model="theme"
    :predefine="[
      '#409EFF',
      '#1890ff',
      '#304156',
      '#212121',
      '#11a983',
      '#13c2c2',
      '#6959CD',
      '#f5222d',
    ]"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useSettingsStore } from "@/stores";

const ORIGINAL_THEME = "#409EFF";

const settingsStore = useSettingsStore();
const theme = ref("");
const chalk = ref("");

watch(
  () => settingsStore.theme,
  (val) => {
    theme.value = val;
  },
  { immediate: true },
);

watch(theme, async (val) => {
  const oldVal = chalk.value ? theme.value : ORIGINAL_THEME;
  if (typeof val !== "string") return;

  const themeCluster = getThemeCluster(val.replace("#", ""));
  const originalCluster = getThemeCluster(oldVal.replace("#", ""));

  const loadingInstance = ElMessage({
    message: "Compiling the theme",
    customClass: "theme-message",
    type: "success",
    duration: 0,
    iconClass: "el-icon-loading",
  });

  const getHandler = (variable: string, id: string) => {
    return () => {
      const originalCluster = getThemeCluster(ORIGINAL_THEME.replace("#", ""));
      const newStyle = updateStyle(
        variable === "chalk" ? chalk.value : "",
        originalCluster,
        themeCluster,
      );

      let styleTag = document.getElementById(id);
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.setAttribute("id", id);
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = newStyle;
    };
  };

  if (!chalk.value) {
    // For Element Plus, we use CSS variables instead of dynamic theme loading
    // The theme is controlled by SCSS variables in element-variables.scss
    // This is a simplified version that updates CSS variables
  }

  const chalkHandler = getHandler("chalk", "chalk-style");
  chalkHandler();

  const styles = Array.from(document.querySelectorAll("style")).filter(
    (style) => {
      const text = style.innerHTML;
      return (
        new RegExp(oldVal, "i").test(text) && !/Chalk Variables/.test(text)
      );
    },
  );
  styles.forEach((style) => {
    const { innerHTML } = style;
    if (typeof innerHTML !== "string") return;
    style.innerHTML = updateStyle(innerHTML, originalCluster, themeCluster);
  });

  settingsStore.changeSetting({ key: "theme", value: val });
  loadingInstance.close();
});

function updateStyle(
  style: string,
  oldCluster: string[],
  newCluster: string[],
) {
  let newStyle = style;
  oldCluster.forEach((color, index) => {
    newStyle = newStyle.replace(new RegExp(color, "ig"), newCluster[index]);
  });
  return newStyle;
}

function getThemeCluster(theme: string) {
  const tintColor = (color: string, tint: number) => {
    let red = parseInt(color.slice(0, 2), 16);
    let green = parseInt(color.slice(2, 4), 16);
    let blue = parseInt(color.slice(4, 6), 16);

    if (tint === 0) {
      return [red, green, blue].join(",");
    } else {
      red += Math.round(tint * (255 - red));
      green += Math.round(tint * (255 - green));
      blue += Math.round(tint * (255 - blue));

      red = red.toString(16).padStart(2, "0");
      green = green.toString(16).padStart(2, "0");
      blue = blue.toString(16).padStart(2, "0");

      return `#${red}${green}${blue}`;
    }
  };

  const shadeColor = (color: string, shade: number) => {
    let red = parseInt(color.slice(0, 2), 16);
    let green = parseInt(color.slice(2, 4), 16);
    let blue = parseInt(color.slice(4, 6), 16);

    red = Math.round((1 - shade) * red);
    green = Math.round((1 - shade) * green);
    blue = Math.round((1 - shade) * blue);

    red = red.toString(16).padStart(2, "0");
    green = green.toString(16).padStart(2, "0");
    blue = blue.toString(16).padStart(2, "0");

    return `#${red}${green}${blue}`;
  };

  const clusters = [theme];
  for (let i = 0; i <= 9; i++) {
    clusters.push(tintColor(theme, Number((i / 10).toFixed(2))));
  }
  clusters.push(shadeColor(theme, 0.1));
  return clusters;
}
</script>

<style>
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker :deep(.el-color-picker__trigger) {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown :deep(.el-color-dropdown__link-btn) {
  display: none;
}
</style>
