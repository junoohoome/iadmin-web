<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

const tagAndTagSpacing = 4

const scrollContainer = ref()
const left = ref(0)

const scrollWrapper = ref<HTMLElement>()

function handleScroll(e: WheelEvent) {
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
  if (scrollWrapper.value) {
    scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollLeft + eventDelta / 4
  }
}

function moveToTarget(currentTag: HTMLElement) {
  if (!scrollContainer.value) return

  const $container = scrollContainer.value.$el as HTMLElement
  const $containerWidth = $container.offsetWidth
  const $scrollWrapper = scrollContainer.value.$refs?.wrap as HTMLElement | undefined

  if (!$scrollWrapper) return

  // 获取父组件中的 tag 引用
  const tags = (currentTag.parentElement?.children || []) as HTMLElement[]

  let firstTag: HTMLElement | null = null
  let lastTag: HTMLElement | null = null

  if (tags.length > 0) {
    firstTag = tags[0]
    lastTag = tags[tags.length - 1]
  }

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
  } else {
    const currentIndex = Array.from(tags).findIndex((item) => item === currentTag)
    const prevTag = tags[currentIndex - 1]
    const nextTag = tags[currentIndex + 1]

    if (nextTag) {
      const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + tagAndTagSpacing
      if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
        $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
      }
    }

    if (prevTag) {
      const beforePrevTagOffsetLeft = prevTag.offsetLeft - tagAndTagSpacing
      if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
        $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
      }
    }
  }
}

defineExpose({
  moveToTarget
})
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;

  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }

  :deep(.el-scrollbar__wrap) {
    height: 49px;
  }
}
</style>
