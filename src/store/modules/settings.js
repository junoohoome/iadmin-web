import variables from '@/styles/element-variables.scss'
import Config from '@/settings'

const state = {
  theme: variables.theme,
  showSettings: Config.showSettings,
  tagsView: Config.tagsView,
  fixedHeader: Config.fixedHeader,
  sidebarLogo: Config.sidebarLogo,
  showFooter: Config.showFooter,
  footerTxt: Config.footerTxt,
  caseNumber: Config.caseNumber
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

