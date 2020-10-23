const dev = process.env.NODE_ENV === `development`
// const sentryDSN = process.env.SENTRY_DSN || ""

const fallbackNetwork = `cosmos-hub-mainnet`

export default {
  name: `Lunie`,
  development: dev,
  network: process.env.NETWORK || fallbackNetwork,
  google_analytics_uid: process.env.GOOGLE_ANALYTICS_UID || '',
  //   sentryDSN: dev ? "" : sentryDSN,
  default_gas_price: dev ? 1e-9 : 0.65e-8, // Recommended from Cosmos Docs devided by 4 as we increased the gas amount heavily

  // Ledger
  CosmosAppTestModeAllowed: false,

  //   graphqlHost: graphql,

  e2e: process.env.VUE_APP_E2E || false,
}
