<template>
  <div>
    <SvgIcon :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" @click="click" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import screenfull from 'screenfull'

const isFullscreen = ref(false)

function click() {
  if (!screenfull.isEnabled) {
    ElMessage.warning('您的浏览器不支持全屏功能')
    return false
  }
  screenfull.toggle()
}

function change() {
  isFullscreen.value = screenfull.isFullscreen
}

function init() {
  if (screenfull.isEnabled) {
    screenfull.on('change', change)
  }
}

function destroy() {
  if (screenfull.isEnabled) {
    screenfull.off('change', change)
  }
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  destroy()
})
</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
</style>
