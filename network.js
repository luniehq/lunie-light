export default {
  id: 'cosmos-hub-mainnet',
  chain_id: 'cosmos-hub-3', // TODO get from chain?
  name: 'Cosmos Hub',
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
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  bech32Prefix: 'cosmos',
  lockUpPeriod: `21 days`,

  // utility functions
  // TODO put in a wrapper outside this file
  getCoinLookup(network, denom, coinLookupDenomType = `chainDenom`) {
    return network.coinLookup.find(
      (coin) => coin[coinLookupDenomType] === denom
    )
  },
}
