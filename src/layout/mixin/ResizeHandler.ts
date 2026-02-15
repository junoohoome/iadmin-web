import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/stores/app'

const WIDTH = 992 // refer to Bootstrap's responsive design

/**
 * Resize handler composable
 * 处理窗口大小变化时的设备检测和侧边栏状态
 */

export function useResizeHandler() {
  const appStore = useAppStore()

  // 缓存当前设备类型，避免重复更新
  const currentDevice = ref<string>('')

  // 防抖定时器
  let resizeTimer: ReturnType<typeof setTimeout> | null = null

  function isMobile(): boolean {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  const resizeHandler = () => {
    // 防抖处理
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }

    resizeTimer = setTimeout(() => {
      if (document.hidden) return

      const isMobileDevice = isMobile()
      const newDevice = isMobileDevice ? 'mobile' : 'desktop'

      // 只有设备类型变化时才更新 store
      if (currentDevice.value !== newDevice) {
        currentDevice.value = newDevice
        appStore.toggleDevice(newDevice as 'mobile' | 'desktop')
      }
    }, 100)
  }

  onMounted(() => {
    // 初始化当前设备类型
    currentDevice.value = appStore.device
    window.addEventListener('resize', resizeHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
  })

  return {
    isMobile
  }
}

export default useResizeHandler
