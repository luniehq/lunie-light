export const strict = false

export const state = () => ({
  session: undefined,
})

export const mutations = {
  setSession(state, session) {
    state.session = session
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

    // connect to the extension ahead of signing with it
    if (session && session.sessionType === 'extension') {
      dispatch('extension/init', undefined, { root: true })
    }
  },
}
