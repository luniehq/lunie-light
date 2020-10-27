import network from '~/common/network'
import DataSource from '~/common/terraV2-source'

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
}

export const actions = {
  async refresh({ dispatch }) {
    const session = this.$cookies.get('lunie-session')
    const currency = this.$cookies.get('currency') || 'USD'
    const calls = [dispatch('getValidators'), dispatch('getBlock')]
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
  async getBlock({ commit }) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const block = await api.getBlockV2()
    commit('setBlock', block)
  },
  async getBalances({ commit }, { address, currency }) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const balances = await api.getBalancesV2FromAddress(
      address,
      currency,
      network
    )
    commit('setBalances', balances)
  },
  async getValidators({ commit }) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const validators = await api.getAllValidators()
    commit('setValidators', validators)
  },
  async getDelegations({ commit }, address) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const delegations = await api.getDelegationsForDelegatorAddress(address)
    commit('setDelegations', delegations)
  },
  async getUndelegations({ commit }, address) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const undelegations = await api.getUndelegationsForDelegatorAddress(address)
    commit('setUndelegations', undelegations)
  },
  async getRewards({ commit }, { address, currency }) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const rewards = await api.getRewards(address, currency, network)
    commit('setRewards', rewards)
  },
  async getAccountInfo({ commit }, address) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const { accountNumber, sequence } = await api.getAccountInfo(address)
    commit('setAccountInfo', { accountNumber, sequence })
    return { accountNumber, sequence }
  },
  async getTransactions({ commit }, { address, pageNumber = 0 }) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const transactions = await api.getTransactionsV2(address, pageNumber)
    commit('setTransactions', { transactions, pageNumber })
  },
  async getValidatorSelfStake(store, address) {
    const _store = {}
    const api = new DataSource(this.$axios, network, _store, null, null)
    const selfStake = await api.getSelfStake(address)
    return selfStake
  },
}
