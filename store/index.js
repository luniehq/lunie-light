export const state = () => ({
  session: undefined,
  currrentModalOpen: false,
})

export const mutations = {
  setSession(state, session) {
    state.session = session
  },
  setCurrrentModalOpen(state, modal) {
    state.currrentModalOpen = modal
  },
}

export const actions = {
  nuxtClientInit({ commit }, { app: { $cookies } }) {
    const session = $cookies.get('lunie-session')
    commit('setSession', session)
  },
  signIn({ commit, dispatch }, session) {
    dispatch('data/resetSessionData')
    if (!session) {
      this.$cookies.remove('lunie-session')
    } else {
      this.$cookies.set('lunie-session', session)
    }
    commit('setSession', session)
    dispatch('data/refresh')
    dispatch('data/loadProposals')
  },
}
