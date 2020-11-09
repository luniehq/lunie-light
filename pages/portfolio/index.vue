<template>
  <div>
    <Balances :balances="balances" :rewards="rewards" />
    <DelegationsOverview
      :balances="balances"
      :rewards="rewards"
      :delegations="delegations"
    />
    <Undelegations :undelegations="undelegations" />
  </div>
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
  middleware: 'addressRequired',
}
</script>
