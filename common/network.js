import network from '~/network'

export default {
  ...network,

  // utility functions
  // TODO put in a wrapper outside this file
  getCoinLookup(denom, coinLookupDenomType = `chainDenom`) {
    return this.coinLookup.find((coin) => coin[coinLookupDenomType] === denom)
  },
}
