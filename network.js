export default {
  id: 'cosmos-hub-mainnet',
  api_url: 'https://lcd.nylira.net',
  stakingDenom: 'ATOM',
  coinLookup: [
    {
      viewDenom: 'ATOM',
      chainDenom: 'uatom',
      chainToViewConversionFactor: 1e-6,
    },
  ],
  network_type: 'cosmos',
}
