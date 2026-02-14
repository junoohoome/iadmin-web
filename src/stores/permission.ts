import { defineStore } from 'pinia'
import { constantRoutes } from '@/router'
import { buildRoute } from '@/api/login'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types'

const Layout = () => import('@/layout/index.vue')

// 开发环境默认路由（当后端未返回路由时使用）
const DEFAULT_ROUTES: MenuItem[] = [
  {
    id: 1,
    parentId: 0,
    name: 'System',
    path: '/system',
    component: 'Layout',
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'system' },
    type: 'directory',
    sort: 1,
    children: [
      {
        id: 11,
        parentId: 1,
        name: 'User',
        path: 'user',
        component: 'system/user/index',
        meta: { title: '用户管理', icon: 'user' },
        type: 'menu',
        sort: 1,
      },
      {
        id: 12,
        parentId: 1,
        name: 'Role',
        path: 'role',
        component: 'system/role/index',
        meta: { title: '角色管理', icon: 'peoples' },
        type: 'menu',
        sort: 2,
      },
      {
        id: 13,
        parentId: 1,
        name: 'Menu',
        path: 'menu',
        component: 'system/menu/index',
        meta: { title: '菜单管理', icon: 'tree-table' },
        type: 'menu',
        sort: 3,
      },
      {
        id: 14,
        parentId: 1,
        name: 'Dict',
        path: 'dict',
        component: 'system/dict/index',
        meta: { title: '字典管理', icon: 'education' },
        type: 'menu',
        sort: 4,
      },
    ]
  },
  {
    id: 2,
    parentId: 0,
    name: 'Monitor',
    path: '/monitor',
    component: 'Layout',
    redirect: '/monitor/operLog',
    meta: { title: '系统监控', icon: 'monitor' },
    type: 'directory',
    sort: 2,
    children: [
      {
        id: 21,
        parentId: 2,
        name: 'OperLog',
        path: 'operLog',
        component: 'monitor/oper-log/index',
        meta: { title: '操作日志', icon: 'log' },
        type: 'menu',
        sort: 1,
      },
      {
        id: 22,
        parentId: 2,
        name: 'LoginLog',
        path: 'loginLog',
        component: 'monitor/login-log/index',
        meta: { title: '登录日志', icon: 'log' },
        type: 'menu',
        sort: 2,
      },
    ]
  }
]

interface PermissionState {
  routes: RouteRecordRaw[]
  addRoutes: RouteRecordRaw[]
}

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
        try {
          // 从后端获取路由配置
          const response = await buildRoute()
          let accessedRoutes: RouteRecordRaw[] = response.data

          if (!accessedRoutes || accessedRoutes.length === 0) {
            // 使用默认路由作为fallback
            accessedRoutes = filterAsyncRouter(DEFAULT_ROUTES)
            this.SET_ROUTES(accessedRoutes)
            resolve(accessedRoutes)
            return
          }

          // 转换路由组件
          accessedRoutes = filterAsyncRouter(accessedRoutes)
          this.SET_ROUTES(accessedRoutes)
          resolve(accessedRoutes)
        } catch (error) {
          // 出错时使用默认路由
          const accessedRoutes = filterAsyncRouter(DEFAULT_ROUTES)
          this.SET_ROUTES(accessedRoutes)
          resolve(accessedRoutes)
        }
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
      const hiddenValue = route.hidden
      if (typeof hiddenValue === 'string') {
        (route as MenuItem).hidden = hiddenValue === '1'
      } else if (typeof route.visible === 'string') {
        // If hidden is not present, convert visible to hidden
        // visible="0" means hidden=true, visible="1" means hidden=false
        (route as MenuItem).hidden = route.visible === '0'
      }

      // Fix child routes: convert absolute paths to relative paths
      // Backend returns "/role" but we need "role" for proper nesting
      if (route.path && route.path.startsWith('/') && (route as any).parentId !== 0) {
        route.path = route.path.substring(1)
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
const modules = import.meta.glob('../views/**/*.vue')

// 调试模式下打印可用的模块路径
if (import.meta.env.DEV) {
  console.log('[Permission] Available view modules:', Object.keys(modules).map(k => k.replace('../views/', '')))
}

export function loadView(view: string) {
  // 尝试多种路径格式 - 使用相对路径
  const possibleKeys = [
    `../views/${view}.vue`,
    `../views/${view}`,
  ]

  for (const key of possibleKeys) {
    if (modules[key]) {
      return modules[key]
    }
  }

  // 如果都没找到，使用默认 404 页面
  return () => import('../views/error/404.vue')
}
