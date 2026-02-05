import { defineStore } from 'pinia'
import { constantRoutes } from '@/router'
import { buildRoute } from '@/api/login'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types'

interface PermissionState {
  routes: RouteRecordRaw[]
  addRoutes: RouteRecordRaw[]
}

const Layout = () => import('@/layout/index.vue')

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: []
  }),

  getters: {
    allRoutes: (state) => constantRoutes.concat(state.addRoutes)
  },

  actions: {
    SET_ROUTES(routes: RouteRecordRaw[]) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },

    // 根据角色生成路由
    async generateRoutes(roles: string[]) {
      return new Promise<RouteRecordRaw[]>(async (resolve) => {
        // 从后端获取路由配置
        const response = await buildRoute()
        let accessedRoutes: RouteRecordRaw[] = response.data

        // 转换路由组件
        accessedRoutes = filterAsyncRouter(accessedRoutes)

        this.SET_ROUTES(accessedRoutes)
        resolve(accessedRoutes)
      })
    }
  }
})

/**
 * 遍历后台传来的路由字符串，转换为组件对象
 */
export function filterAsyncRouter(routes: MenuItem[]): RouteRecordRaw[] {
  return routes
    .filter((route) => {
      // Convert hidden/visible from string to boolean
      // Backend sends: hidden="0" (visible) or hidden="1" (hidden)
      // Also handle visible field: visible="0" (hidden) or visible="1" (visible)
      const hiddenValue = (route as any).hidden
      if (typeof hiddenValue === 'string') {
        (route as any).hidden = hiddenValue === '1'
      } else if (typeof route.visible === 'string') {
        // If hidden is not present, convert visible to hidden
        // visible="0" means hidden=true, visible="1" means hidden=false
        (route as any).hidden = route.visible === '0'
      }

      if (route.component) {
        if (route.component === 'Layout') {
          route.component = Layout
        } else {
          const component = route.component
          route.component = loadView(component)
        }
      }
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children)
      }
      return true
    })
    .map((route) => route as unknown as RouteRecordRaw)
}

/**
 * 路由懒加载 - 使用 Vite glob 预加载所有 views 组件
 */
const modules = import.meta.glob('@/views/**/*.vue')

export function loadView(view: string) {
  const key = `@/views/${view}.vue`
  const component = modules[key]

  if (!component) {
    console.warn(`View component not found: ${view}`)
    return () => import('@/views/error/404.vue')
  }

  return component
}
