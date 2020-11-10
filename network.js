export default {
  id: 'cosmos-mainnet',
  chainId: 'cosmoshub-3', // TODO get from chain?
  name: 'Cosmos Hub',
  description:
    'Cosmos is a decentralized network of independent parallel blockchains, each powered by BFT consensus algorithms like Tendermint consensus.',
  logo: `logo.svg`,
  website: 'https://cosmos.network',
  apiURL: 'https://lcd.nylira.net',
  stakingDenom: 'ATOM',
  coinLookup: [
    {
      viewDenom: 'ATOM',
      chainDenom: 'uatom',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  addressPrefix: 'cosmos',
  HDPath: `m/44'/118'/0'/0/0`,
  curve: 'ed25519',
  lockUpPeriod: `21 days`,
  fees: {
    default: {
      gasEstimate: 350000,
      feeOptions: [
        {
          denom: 'ATOM',
          amount: 0.1,
        },
      ],
    },
  },
  icon: '~/assets/images/currencies/atom.png',
  links: [
    {
      title: 'Cosmos Governance Docs',
      type: 'docs',
      link: 'https://docs.cosmos.network/master/modules/gov/',
    },
    {
      title: 'Cosmos Governance Forum',
      type: 'forum',
      link: 'https://forum.cosmos.network/c/governance/16',
    },
    {
      title: 'Lunie Cosmos Staking Guide',
      type: 'guide',
      link:
        'http://help.lunie.io/en/articles/3625860-how-cosmos-governance-works',
    },
  ],
  localSigning: false,
}
