export default {
  id: 'cosmos-testnet',
  name: 'Cosmos Stargate',
  description:
    'Cosmos is a network of independent parallel blockchains, powered by BFT consensus algorithms like Tendermint.',
  logo: `logo.svg`,
  website: 'https://cosmos.network',
  apiURL: 'http://localhost:8010/proxy', // use `npx lcp --proxyUrl http://34.123.30.100:1317`
  rpcURL: 'ws://34.123.30.100:26657',
  stakingDenom: 'MUON',
  coinLookup: [
    {
      viewDenom: 'MUON',
      chainDenom: 'umuon',
      chainToViewConversionFactor: 1e-6,
      icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png`,
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
  icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png`,
  localSigning: false,
}
