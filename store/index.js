export const state = () => ({
  address: undefined,
  session: {},
})

export const mutations = {
  setAddress(state, address) {
    state.address = address
  },
}

export const actions = {
  // TODO check if needed as store.state.address in asyncData is empty anyways
  nuxtServerInit({ commit }, { app: { $cookies } }) {
    const address = $cookies.get('address')
    commit('setAddress', address)
  },
  signIn({ commit }, address) {
    // to be able to render the page for the user in SSR we need to set the address as a cookie
    if (!address) {
      this.$cookies.remove('address')
    } else {
      this.$cookies.set('address', address)
    }
    commit('setAddress', address)
  },
}
