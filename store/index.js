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
  nuxtServerInit({ commit }, { app: { $cookies } }) {
    const session = JSON.parse($cookies.get('session'))
    commit('setSession', session)
  },
  signIn({ commit }, session) {
    // to be able to render the page for the user in SSR we need to set the address as a cookie
    if (!session) {
      this.$cookies.remove('session')
    } else {
      this.$cookies.set('session', session)
    }
    commit('setSession', session)
  },
}
