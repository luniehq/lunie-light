export default {
  id: 'emoney-mainnet',
  chainId: 'emoney-1', // TODO get from chain?
  name: 'e-Money',
  description: 'e-Money, the world of money.',
  website: 'https://e-money.com',
  apiURL: 'https://emoney.validator.network/light',
  stakingDenom: 'NGM',
  coinLookup: [
    {
      viewDenom: 'NGM',
      chainDenom: 'ungm',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'eSEK',
      chainDenom: 'esek',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'eDKK',
      chainDenom: 'edkk',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'eCHF',
      chainDenom: 'echf',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'eNOK',
      chainDenom: 'enok',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'eJPY',
      chainDenom: 'ejpy',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'eUSD',
      chainDenom: 'eusd',
      chainToViewConversionFactor: 1e-6,
    },
    {
      viewDenom: 'eEUR',
      chainDenom: 'eeur',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  addressPrefix: 'emoney',
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  lockUpPeriod: `21 days`,
  fees: {
    default: {
      gasEstimate: 550000,
    },
    SendTx: {
      gasEstimate: 75000,
    },
  },
}
