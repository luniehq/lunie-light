export default {
  id: 'terra-mainnet',
  chain_id: 'tequila-0004', // TODO get from chain?
  name: 'Terra Testnet',
  api_url: 'https://tequila-lcd.terra.dev',
  stakingDenom: 'LUNA',
  coinLookup: [
    {
      viewDenom: 'LUNA',
      chainDenom: 'uluna',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  network_type: 'cosmos',
  address_prefix: 'terra',
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  lockUpPeriod: `21 days`,
}
