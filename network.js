export default {
  id: 'terra-testnet',
  chainId: 'columbus-4', // TODO get from chain?
  name: 'Terra Testnet',
  description:
    'Terra aims to make its stablecoins available to every developer on every blockchain.',
  website: 'https://terra.money',
  apiURL: 'https://lcd-terra.p2p.org',
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
  addressPrefix: 'terra',
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  lockUpPeriod: `21 days`,
  fees: {
    default: [
      {
        gasEstimate: 350000,
        fee: {
          denom: 'LUNA',
          amount: 0.00000015,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'KRT',
          amount: 0.0000018,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'MNT',
          amount: 0.0000045,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'SDT',
          amount: 0.0000001,
        },
      },
      {
        gasEstimate: 350000,
        fee: {
          denom: 'UST',
          amount: 0.00000015,
        },
      },
    ],
  },
}
