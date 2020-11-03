import network from '~/common/network'
import DataSource from '~/common/cosmosV2-source'

export const state = () => ({
  block: undefined,
  balances: [],
  rewards: [],
  delegations: [],
  undelegations: [],
  validators: [],
  accountInfo: undefined,
  transactions: [],
  transactionsLoaded: undefined,
  moreTransactionsAvailable: true,
  api: undefined,
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
  setTransactions(state, { transactions, pageNumber }) {
    if (pageNumber > 0) {
      state.transactions = state.transactions.concat(transactions)
    } else {
      state.transactions = transactions
    }
    state.transactionsLoaded = true
    state.moreTransactionsAvailable = transactions.length > 0
  },
  resetSessionData(state) {
    state.balances = []
    state.rewards = []
    state.delegations = []
    state.undelegations = []
    state.rewards = []
    state.transactions = []
    state.transactionsLoaded = undefined
    state.moreTransactionsAvailable = true
  },
}

export const actions = {
  init({ commit }) {
    const _store = {}
    commit('setApi', new DataSource(this.$axios, network, _store, null, null))
  },
  async refresh({ dispatch }) {
    const calls = [
      dispatch('getValidators'),
      dispatch('getBlock'),
      dispatch('refreshSession'),
    ]
    await Promise.all(calls)
  },
  async refreshSession({ dispatch }) {
    const calls = []
    const session = this.$cookies.get('lunie-session')
    const currency = this.$cookies.get('currency') || 'USD'
    if (session) {
      const address = session.address
      calls.push(
        dispatch('getBalances', { address, currency }),
        dispatch('getRewards', { address, currency }),
        dispatch('getDelegations', address),
        dispatch('getUndelegations', address)
      )
    }
    await Promise.all(calls)
  },
  async getBlock({ commit, state: { api } }) {
    const block = await api.getBlockHeader()
    commit('setBlock', block)
  },
  async getBalances({ commit, state: { api } }, { address, currency }) {
    const balances = await api.getBalancesV2FromAddress(
      address,
      currency,
      network
    )
    commit('setBalances', balances)
  },
  async getValidators({ commit, state: { api } }) {
    const validators = await api.getAllValidators()
    commit('setValidators', validators)
  },
  async getDelegations({ commit, state: { api } }, address) {
    const delegations = await api.getDelegationsForDelegatorAddress(address)
    commit('setDelegations', delegations)
  },
  async getUndelegations({ commit, state: { api } }, address) {
    const undelegations = await api.getUndelegationsForDelegatorAddress(address)
    commit('setUndelegations', undelegations)
  },
  async getRewards({ commit, state: { api } }, { address, currency }) {
    const rewards = await api.getRewards(address, currency, network)
    commit('setRewards', rewards)
  },
  async getAccountInfo({ commit, state: { api } }, address) {
    const { accountNumber, sequence } = await api.getAccountInfo(address)
    commit('setAccountInfo', { accountNumber, sequence })
    return { accountNumber, sequence }
  },
  async getTransactions(
    { commit, state: { api } },
    { address, pageNumber = 0 }
  ) {
    const transactions = await api.getTransactionsV2(address, pageNumber)
    commit('setTransactions', { transactions, pageNumber })
  },
  async getValidatorSelfStake({ state: { api } }, validator) {
    const selfStake = await api.getSelfStake(validator)
    return selfStake
  },
  async getValidatorDelegations({ state: { api } }, validator) {
    const delegations = await api.getValidatorDelegations(validator)
    return delegations
  },
  resetSessionData({ commit }) {
    commit('resetSessionData')
  },
}
