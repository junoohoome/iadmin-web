import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { RouteMeta } from '@/types'

/* Layout */
const Layout = () => import('@/layout/index.vue')

/**
 * 通用路由配置
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    meta: { hidden: true } as RouteMeta,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue'),
        meta: { hidden: true } as RouteMeta
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    meta: { hidden: true } as RouteMeta
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    meta: { hidden: true } as RouteMeta
  },
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/index.vue'),
        meta: {
          title: '首页',
          icon: 'dashboard',
          noCache: true,
          affix: true
        } as RouteMeta
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    meta: { hidden: true } as RouteMeta,
    redirect: '/user/profile',
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'user'
        } as RouteMeta
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

// 重置路由方法
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    scrollBehavior: () => ({ top: 0 }),
    routes: constantRoutes
  })
  ;(router as any).matcher = (newRouter as any).matcher
}

export default router
