export default {
  id: 'terra-mainnet',
  chain_id: 'cosmos-hub-3', // TODO get from chain?
  name: 'Terra Testnet',
  api_url: 'https://lcd.nylira.net',
  stakingDenom: 'ATOM',
  coinLookup: [
    {
      viewDenom: 'ATOM',
      chainDenom: 'uatom',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'KRT',
      chainDenom: 'ukrw',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'MNT',
      chainDenom: 'umnt',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'UST',
      chainDenom: 'uusd',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'SDT',
      chainDenom: 'usdr',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  network_type: 'cosmos',
  address_prefix: 'cosmos',
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  lockUpPeriod: `21 days`,
}
