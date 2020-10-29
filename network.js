export default {
  id: 'cosmos-mainnet',
  chain_id: 'cosmos-hub-3', // TODO get from chain?
  name: 'Cosmos Hub',
  description: 'Cosmos is a decentralized network of independent parallel blockchains, each powered by BFT consensus algorithms like Tendermint consensus.',
  website: 'https://cosmos.network',
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
  lockUpPeriod: `21 days`,
}
