export default {
  id: 'cosmos-mainnet',
  name: 'Cosmos Hub',
  description:
    'Cosmos is a decentralized network of independent parallel blockchains, each powered by BFT consensus algorithms like Tendermint consensus.',
  logo: `logo.svg`,
  website: 'https://cosmos.network',
  apiURL: 'https://api.allorigins.win/raw?url=http://34.123.30.100:1317',
  stakingDenom: 'MUON',
  coinLookup: [
    {
      viewDenom: 'MUON',
      chainDenom: 'umuon',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  addressPrefix: 'cosmos',
  validatorAddressPrefix: 'cosmosvaloper',
  validatorConsensusaddressPrefix: 'cosmosvalcons', // needed to map validators from staking queries to the validator set
  HDPath: `m/44'/118'/0'/0/0`,
  lockUpPeriod: `21 days`,
  fees: {
    default: {
      gasEstimate: 350000,
      feeOptions: [
        {
          denom: 'MUON',
          amount: 0.001,
        },
      ],
    },
  },
  icon: '~/assets/images/currencies/atom.png',
  localSigning: true,
}
