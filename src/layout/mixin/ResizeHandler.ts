import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const { body } = document

const WIDTH = 992 // refer to Bootstrap's responsive design

/**
 * Resize handler composable
 * 替代 Vue 2 的 mixin，用于处理窗口大小变化时的设备检测和侧边栏状态
 */

export function useResizeHandler() {
  const route = useRoute()
  const appStore = useAppStore()

  function isMobile() {
    const rect = body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  // 重新实现的 resizeHandler，避免无限循环
  // 不在 resize 时直接修改 appStore，防止触发其他计算属性
  const resizeHandler = () => {
    if (!document.hidden) {
      const isMobileDevice = isMobile()
      appStore.toggleDevice(isMobileDevice ? 'mobile' : 'desktop')
    }
  }

  onMounted(() => {
    // 只添加窗口监听，不直接调用 appStore 方法
    window.addEventListener('resize', resizeHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })

  return {
    resizeHandler,
    isMobile
  }
}

export default useResizeHandler
