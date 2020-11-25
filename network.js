export default {
  id: 'emoney-2',
  name: 'e-Money',
  description:
    'e-Money is the leading issuer of interest-bearing, currency-backed stablecoins for the Internet of Money.',
  logo: `logo.svg`,
  website: 'https://e-money.com',
  rpcURL: 'https://emoney.validator.network/',
  apiURL: 'https://emoney.validator.network/light',
  stakingDenom: 'NGM',
  coinLookup: [
    {
      viewDenom: 'NGM',
      chainDenom: 'ungm',
      chainToViewConversionFactor: 1e-6,
      icon: `network-icons/e-money.png`,
    },
    {
      viewDenom: 'eEUR',
      chainDenom: 'eeur',
      chainToViewConversionFactor: 1e-6,
      icon: `network-icons/e-money.png`,
    },
    {
      viewDenom: 'eCHF',
      chainDenom: 'echf',
      chainToViewConversionFactor: 1e-6,
      icon: `network-icons/e-money.png`,
    },
    {
      viewDenom: 'eSEK',
      chainDenom: 'esek',
      chainToViewConversionFactor: 1e-6,
      icon: `network-icons/e-money.png`,
    },
    {
      viewDenom: 'eNOK',
      chainDenom: 'enok',
      chainToViewConversionFactor: 1e-6,
      icon: `network-icons/e-money.png`,
    },
    {
      viewDenom: 'eDKK',
      chainDenom: 'edkk',
      chainToViewConversionFactor: 1e-6,
      icon: `network-icons/e-money.png`,
    },
    {
      viewDenom: 'ATOM',
      chainDenom: 'uatom',
      chainToViewConversionFactor: 1e-6,
      icon: `network-icons/cosmos.png`,
    },
  ],
  addressPrefix: 'emoney',
  validatorAddressPrefix: 'emoneyvaloper',
  validatorConsensusaddressPrefix: 'emoneyvalcons', // needed to map validators from staking queries to the validator set
  HDPath: `m/44'/118'/0'/0/0`,
  lockUpPeriod: `3 days`,
  fees: {
    default: {
      gasEstimate: 200000,
      feeOptions: [
        {
          denom: 'NGM',
          amount: 0.2,
        },
        {
          denom: 'eEUR',
          amount: 0.05,
        },
        {
          denom: 'eCHF',
          amount: 0.053,
        },
        {
          denom: 'eDKK',
          amount: 0.37,
        },
        {
          denom: 'eSEK',
          amount: 0.55,
        },
        {
          denom: 'eNOK',
          amount: 0.61,
        },
      ],
    },
    SendTx: {
      gasEstimate: 100000,
      feeOptions: [
        {
          denom: 'NGM',
          amount: 0.1,
        },
        {
          denom: 'eEUR',
          amount: 0.05,
        },
        {
          denom: 'eCHF',
          amount: 0.053,
        },
        {
          denom: 'eDKK',
          amount: 0.37,
        },
        {
          denom: 'eSEK',
          amount: 0.55,
        },
        {
          denom: 'eNOK',
          amount: 0.61,
        },
      ],
    },
  },
  localSigning: true,
}
