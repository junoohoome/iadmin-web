import { constantRoutes } from '@/router'
import { buildRoute } from '@/api/login'
import Layout from '@/layout'

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      // 根据用户角色查询菜单
      buildRoute().then(response => {
        let accessedRoutes = response.data
        // 匹配不了的路径，跳转到404，该路由需添加到最后
        // accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
        accessedRoutes = filterAsyncRouter(accessedRoutes)
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  }
}

/**
 *  遍历后台传来的路由字符串，转换为组件对象
 * @param routers
 * @returns {*}
 */
export const filterAsyncRouter = (routers) => {
  return routers.filter(router => {
    if (router.component) {
      if (router.component === 'Layout') { // Layout组件特殊处理
        router.component = Layout
      } else {
        const component = router.component
        router.component = loadView(component)
      }
    }
    if (router.children && router.children.length) {
      router.children = filterAsyncRouter(router.children)
    }
    return true
  })
}

/**
 * 路由懒加载
 * @param view
 * @returns {function(): (Promise<*>|*)}
 */
export const loadView = (view) => {
  return () => import(`@/views/${view}`)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
