import { keyBy, uniqBy } from 'lodash'
import network from '~/common/network'
import DataSource from '~/common/cosmosV2-source'
import { updateValidatorImages } from '~/common/keybase'

export const state = () => ({
  block: undefined,
  balances: [],
  balancesLoaded: undefined,
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
      state.transactions = uniqBy(
        state.transactions.concat(transactions),
        'key'
      )
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
        dispatch('getTransactions', { address }),
        dispatch('getDelegations', address),
        dispatch('getUndelegations', address)
      )
    }
    await Promise.all(calls)
  },
  async getBlock({ commit, state: { api } }) {
    try {
      const block = await api.getBlockHeader()
      commit('setBlock', block)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting block failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getBalances({ commit, state: { api } }, { address, currency }) {
    try {
      const balances = await api.getBalancesV2FromAddress(
        address,
        currency,
        network
      )
      commit('setBalances', balances)
      commit('setBalancesLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting balances failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getValidators({ commit, dispatch, state: { api } }) {
    try {
      const validators = await api.getAllValidators()
      commit('setValidators', validators)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting validators failed:' + err.message,
        },
        { root: true }
      )
    }
    dispatch('updateValidatorImages')
  },
  async updateValidatorImages({ state, commit }) {
    // get validator images for chunk
    await updateValidatorImages(state.validators, (updatedChunk) => {
      const updatedValidatorsDict = keyBy(updatedChunk, 'operatorAddress')
      // update the validators from our chunk
      const updatedValidators = state.validators.map((validator) => {
        const updatedValidator =
          updatedValidatorsDict[validator.operatorAddress]
        if (updatedValidator) {
          return updatedValidator
        }
        return validator
      })

      // update the store and UI
      commit('setValidators', updatedValidators)
    })
  },
  async getDelegations({ commit, state: { api } }, address) {
    try {
      const delegations = await api.getDelegationsForDelegatorAddress(address)
      commit('setDelegations', delegations)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting delegations failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getUndelegations({ commit, state: { api } }, address) {
    try {
      const undelegations = await api.getUndelegationsForDelegatorAddress(
        address
      )
      commit('setUndelegations', undelegations)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting undelegations failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getRewards({ commit, state: { api } }, { address, currency }) {
    try {
      const rewards = await api.getRewards(address, currency, network)
      commit('setRewards', rewards)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting rewards failed:' + err.message,
        },
        { root: true }
      )
    }
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
    try {
      const transactions = await api.getTransactionsV2(address, pageNumber)
      commit('setTransactions', { transactions, pageNumber })
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting transactions failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getValidatorSelfStake({ commit, state: { api } }, validator) {
    try {
      const selfStake = await api.getSelfStake(validator)
      return selfStake
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting validator self stake failed:' + err.message,
        },
        { root: true }
      )
      return 0
    }
  },
  async getValidatorDelegations({ commit, state: { api } }, validator) {
    try {
      const delegations = await api.getValidatorDelegations(validator)
      return delegations
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting delegations to validator failed:' + err.message,
        },
        { root: true }
      )
    }
    return []
  },
  resetSessionData({ commit }) {
    commit('resetSessionData')
  },
}
