import { getLedger } from '~/common/ledger'

export const state = () => ({
  ledger: undefined,
  accounts: [],
  loading: false,
  error: undefined,
})

export const mutations = {
  // create set methods from data points
  ...Object.fromEntries(
    Object.keys(state()).map((entity) => {
      return [
        `set${entity.charAt(0).toUpperCase()}${entity.substr(1)}`,
        (state, value) => {
          state[entity] = value
        },
      ]
    })
  ),
}

export const actions = {
  async init({ commit }) {
    commit('setLoading', true)
    try {
      const ledger = await getLedger()
      commit('setLedger', ledger)

      const accounts = await ledger.getAccounts()
      commit('setAccounts', accounts)
    } catch (err) {
      commit('setLoading', false)
      commit('setError', err.message)
    }
    commit('setLoading', false)
  },
  close({ commit }) {
    // close ledger connection
    if (state().ledger) {
      state().ledger.close()
    }
    commit('setLedger', undefined)
    commit('setAccounts', [])
  },
}
