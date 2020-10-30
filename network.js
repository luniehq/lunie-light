export default {
  id: 'cosmos-mainnet',
  chainId: 'cosmos-hub-3', // TODO get from chain?
  name: 'Cosmos',
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
      fee: {
        denom: 'ATOM',
        amount: 0.1,
      },
    },
  },
}
