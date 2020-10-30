export default {
  id: 'terra-mainnet',
  chain_id: 'akashnet-1', // TODO get from chain?
  name: 'Akash Mainnet',
  api_url: 'http://localhost:9999/lcd.akash.forbole.com',
  rpc_url: 'http://localhost:9999/rpc.akash.forbole.com',
  stakingDenom: 'AKT',
  coinLookup: [
    {
      viewDenom: 'AKT',
      chainDenom: 'uakt',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  address_prefix: 'akash',
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  lockUpPeriod: `21 days`,

  // utility functions
  // TODO put in a wrapper outside this file
  getCoinLookup(denom, coinLookupDenomType = `chainDenom`) {
    return this.coinLookup.find((coin) => coin[coinLookupDenomType] === denom)
  },
}
