export default {
  id: 'terra-testnet',
  chainId: 'tequila-0004', // TODO get from chain?
  name: 'Terra Testnet',
  description:
    'Terra aims to make its stablecoins available to every developer on every blockchain.',
  website: 'https://terra.money',
  apiURL: 'https://tequila-lcd.terra.dev',
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
    default: {
      gasEstimate: 350000,
      feeOptions: [
        {
          denom: 'LUNA',
          amount: 0.0535,
        },
        {
          denom: 'KRT',
          amount: 63,
        },
        {
          denom: 'MNT',
          amount: 0.045,
        },
        {
          denom: 'SDT',
          amount: 0.01,
        },
        {
          denom: 'UST',
          amount: 0.015,
        },
      ],
    },
  },
}
