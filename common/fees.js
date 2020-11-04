import network from '~/network'

export default {
  ...network.fees,
  getFees(transactionType) {
    const fees = this[transactionType] || this.default
    return fees
  },
}
