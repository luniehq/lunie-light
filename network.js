export default {
  id: 'terra-testnet',
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
  address_prefix: 'terra',
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  lockUpPeriod: `21 days`,
  fees: {
    default: [
      {
        gasEstimate: 350000,
        fee: {
          denom: 'LUNA',
          amount: 0.15,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'KRT',
          amount: 180,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'MNT',
          amount: 450,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'SDT',
          amount: 0.1,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'UST',
          amount: 0.15,
        },
      },
    ],
  },
}
