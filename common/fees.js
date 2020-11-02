import network from '~/network'

export default {
  ...network.fees,
  getFees(transactionType) {
    return this[transactionType] || this.default
  },
}
