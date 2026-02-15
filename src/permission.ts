import router from './router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'
import type { RouteLocationNormalized } from 'vue-router'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/401', '/profile', '/profile/index'] // 白名单路径

// 标记 404 路由是否已添加
let is404Added = false
// 标记动态路由是否已加载
let isRoutesLoaded = false

router.beforeEach(async (to: RouteLocationNormalized, _from, next) => {
  NProgress.start()

  document.title = getPageTitle(to.meta?.title)

  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 如果动态路由已加载，直接放行
      if (isRoutesLoaded) {
        next()
        return
      }

      const userStore = useUserStore()
      const permissionStore = usePermissionStore()

      const hasRoles = userStore.roles && userStore.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          await userStore.getUserInfo()

          const accessRoutes = await permissionStore.generateRoutes(userStore.roles)

          accessRoutes.forEach(route => {
            router.addRoute(route)
          })

          // Add 404 catch-all route AFTER all dynamic routes (only once)
          if (!is404Added) {
            router.addRoute({
              path: '/:pathMatch(.*)*',
              component: () => import('@/views/error/404.vue'),
              meta: { hidden: true } as any
            })
            is404Added = true
          }

          // 标记路由已加载
          isRoutesLoaded = true

          // 使用 replace: true 重新导航到目标路由
          // 确保路径格式正确，避免双斜杠
          const targetPath = to.path || '/'
          next({ path: targetPath, query: to.query, replace: true })
        } catch (error) {
          await userStore.resetToken()
          ElMessage.error((error as Error).message || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
