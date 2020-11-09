import axios from 'axios'

async function getNetworkChainId() {
  const nodeInfo = await axios.get(`https://lcd.nylira.net/blocks/latest`)
  return nodeInfo || 'cosmoshub-3'
}

export default {
  id: 'cosmos-mainnet',
  chainId: getNetworkChainId(),
  name: 'Cosmos Hub',
  description:
    'Cosmos is a decentralized network of independent parallel blockchains, each powered by BFT consensus algorithms like Tendermint consensus.',
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
}
