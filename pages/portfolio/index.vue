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
import { mapState } from 'vuex'

export default {
  name: `page-portfolio`,
  computed: {
    ...mapState('data', [
      'delegations',
      'undelegations',
      'balances',
      'rewards',
    ]),
  },
}
</script>
