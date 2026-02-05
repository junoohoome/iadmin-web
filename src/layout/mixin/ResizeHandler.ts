import { onMounted, onBeforeUnmount, watch } from 'vue'
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

  function resizeHandler() {
    if (!document.hidden) {
      const isMobileDevice = isMobile()
      appStore.toggleDevice(isMobileDevice ? 'mobile' : 'desktop')

      if (isMobileDevice) {
        appStore.closeSideBar({ withoutAnimation: true })
      }
    }
  }

  onMounted(() => {
    window.addEventListener('resize', resizeHandler)
    const isMobileDevice = isMobile()
    if (isMobileDevice) {
      appStore.toggleDevice('mobile')
      appStore.closeSideBar({ withoutAnimation: true })
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })

  watch(
    () => route.path,
    () => {
      if (appStore.device === 'mobile' && appStore.sidebar.opened) {
        appStore.closeSideBar({ withoutAnimation: false })
      }
    }
  )

  return {
    resizeHandler,
    isMobile
  }
}

export default useResizeHandler
