<template>
  <TmPage :sign-in-required="true">
    <template slot="signInRequired">
      <Balances :balances="balances" :rewards="rewards" />
      <DelegationsOverview
        :balances="balances"
        :rewards="rewards"
        :delegations="delegations"
      />
      <Undelegations :undelegations="undelegations" />
    </template>
  </TmPage>
</template>

<script>
import network from '~/network'
import CosmosV2Source from '~/common/cosmosV2-source'

export default {
  name: `page-portfolio`,
  data: () => ({
    delegations: [],
    balances: [],
    rewards: [],
    undelegations: [],
  }),
  async asyncData({ $axios, $cookies, store }) {
    const address = store.state.address
    const currency = $cookies.get('currency') || 'USD' // TODO move to store
    if (!address) return {}

    const _store = {}
    const api = new CosmosV2Source($axios, network, _store, null, null)
    const [delegations, balances, rewards, undelegations] = await Promise.all([
      api.getDelegationsForDelegatorAddress(address),
      api.getBalancesV2FromAddress(address, currency, network),
      api.getRewards(address, currency, network),
      api.getUndelegationsForDelegatorAddress(address),
    ])
    return { delegations, balances, rewards, undelegations }
  },
}
</script>
