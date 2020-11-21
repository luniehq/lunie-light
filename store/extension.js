import {
  getAccountsFromExtension,
  initLunieExtension,
} from '~/common/extension-utils'

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
  async init(store) {
    if (store.state.initialized) {
      getAccountsFromExtension()
      return
    }

    const { commit, dispatch } = store
    commit('setError', undefined)
    commit('setLoading', true)

    initLunieExtension(store)

    try {
      await dispatch('awaitInitialized')
    } catch (err) {
      commit('setError', err)
    } finally {
      commit('setLoading', false)
    }
  },
  async awaitInitialized({ state, dispatch }, trys = 0) {
    if (state.initialized) {
      return
    }

    const maxTrys = 10
    if (trys < maxTrys) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return dispatch('awaitInitialized', trys + 1)
    }

    throw new Error('Could not connect to Lunie extension in time')
  },
}
