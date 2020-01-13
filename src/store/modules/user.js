import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  roles: [],
  permissions: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      login(userInfo.username, userInfo.password, userInfo.code, userInfo.uuid).then(res => {
        setToken(res.token)
        commit('SET_TOKEN', res.token)
        // 用户权限信息，用于页面操作判断用户权限
        if (res.permissions && data.permissions.length > 0) {
          commit('SET_PERMISSIONS', data.permissions.split(','))
        } else {
          commit('SET_PERMISSIONS', [])
        }
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(res => {
        const user = res.data
        console.log('用户信息： ', user)
        const avatar = user.avatar === null ? require('@/assets/image/profile.jpg') : process.env.VUE_APP_BASE_API + '/avatar/' + user.avatar
        if (user.roleIds && user.roleIds.length > 0) { // 验证返回的roles是否是一个非空数组
          commit('SET_ROLES', user.roleIds.split(','))
        } else {
          commit('SET_ROLES', ['ROLE_DEFAULT'])
        }
        commit('SET_NAME', user.username)
        commit('SET_AVATAR', avatar)
        resolve(user)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 退出系统
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 删除 Token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}