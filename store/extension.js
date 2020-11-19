import { initLunieExtension } from '~/common/extension-utils'

export const state = () => ({
  accounts: [],
  initialized: false,
  error: undefined,
  loading: false,
})

export const mutations = {
  setAccounts(state, accounts) {
    state.accounts = accounts
  },
  setInitialized(state) {
    state.initialized = true
  },
  setError(state, error) {
    state.error = error
  },
  setLoading(state, loading) {
    state.loading = loading
  },
}

export const actions = {
  init(store) {
    const { commit } = store
    commit('setError', undefined)
    commit('setLoading', true)

    initLunieExtension(store)
  },
}
