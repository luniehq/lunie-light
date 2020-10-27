import fees from '~/fees'

export default {
  ...fees,
  getFees(transactionType) {
    return this[transactionType] || this.default
  },
}
