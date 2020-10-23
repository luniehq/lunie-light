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
    const session = $cookies.get('lunie-session')
    commit('setSession', session)
  },
  signIn({ commit }, session) {
    // to be able to render the page for the user in SSR we need to set the address as a cookie
    if (!session) {
      this.$cookies.remove('lunie-session')
    } else {
      this.$cookies.set('lunie-session', session)
    }
    commit('setSession', session)
  },
}
