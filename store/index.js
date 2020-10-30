export const state = () => ({
  session: undefined,
  currrentModalOpen: false,
  notificationIdCounter: 0,
  notifications: [],
})

export const mutations = {
  setSession(state, session) {
    state.session = session
  },
  setCurrrentModalOpen(state, modal) {
    state.currrentModalOpen = modal
  },
  addNotification(state, { type, message }) {
    state.notifications.push({
      id: state.notificationIdCounter++,
      type,
      message,
    })
  },
  removeNotification(state, id) {
    state.notifications = state.notifications.filter(
      (notification) => notification.id !== id
    )
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
