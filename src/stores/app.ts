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
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', '1')
      } else {
        Cookies.set('sidebarStatus', '0')
      }
    },

    closeSideBar(options: { withoutAnimation: boolean }) {
      Cookies.set('sidebarStatus', '0')
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = options.withoutAnimation
    },

    toggleDevice(device: 'desktop' | 'mobile') {
      this.device = device
    },

    setSize(size: string) {
      this.size = size
      Cookies.set('size', size)
    }
  },

  persist: {
    key: 'app-store',
    storage: localStorage
  }
})
