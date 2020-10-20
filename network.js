export default {
  id: 'cosmos-hub-mainnet',
  api_url: 'https://lcd.nylira.net',
  stakingDenom: 'ATOM',
  coinLookup: [
    {
      viewDenom: 'ATOM',
      chainDenom: 'uatom',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  network_type: 'cosmos',
  address_prefix: 'cosmos',

  // utility functions
  getCoinLookup(network, denom, coinLookupDenomType = `chainDenom`) {
    return network.coinLookup.find(
      (coin) => coin[coinLookupDenomType] === denom
    )
  },
}
