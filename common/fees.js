import network from '../network'
const BigNumber = require('bignumber.js')

export default {
  ...network.fees,
  getFees(transactionType) {
    const fees = this[transactionType] || this.default
    // convert fees amounts to view denom amounts
    return fees.map((fee) => {
      return {
        ...fee,
        fee: {
          ...fee.fee,
          amount: BigNumber(fee.fee.amount)
            .times(
              network.coinLookup.find(
                ({ viewDenom }) => viewDenom === fee.fee.denom
              ).chainToViewConversionFactor || 1e-6
            )
            .times(fee.gasEstimate)
            .toNumber(),
        },
      }
    })
  },
}
