import { defineStore } from 'pinia'
import Cookies from 'js-cookie'

interface SidebarState {
  opened: boolean
  withoutAnimation: boolean
}

interface AppState {
  sidebar: SidebarState
  device: 'desktop' | 'mobile'
  size: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
      withoutAnimation: false
    },
    device: 'desktop',
    size: Cookies.get('size') || 'small'
  }),

  actions: {
    toggleSidebar() {
      // 避免在动画期间重复触发
      if (this.sidebar.withoutAnimation) return

      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', '1')
      } else {
        Cookies.set('sidebarStatus', '0')
      }
    },

    closeSideBar(options: { withoutAnimation: boolean }) {
      // 避免重复关闭
      if (!this.sidebar.opened) return

      Cookies.set('sidebarStatus', '0')
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = options.withoutAnimation
    },

    toggleDevice(device: 'desktop' | 'mobile') {
      // 只有值变化时才更新，避免触发不必要的响应式更新
      if (this.device !== device) {
        this.device = device
      }
    },

    setSize(size: string) {
      if (this.size !== size) {
        this.size = size
        Cookies.set('size', size)
      }
    }
  },

  persist: {
    key: 'app-store',
    storage: localStorage,
    // 只持久化必要的状态
    pick: ['sidebar', 'size']
  }
})
