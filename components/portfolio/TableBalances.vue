<template>
  <DataTable
    :show-table="balances.length"
    :columns="properties"
    :sort="sort"
    :show-row-count="false"
  >
    <BalanceRow
      v-for="balance in balances"
      :key="balance.id"
      :balance="balance"
      :total-rewards-per-denom="totalRewardsPerDenom"
      :send="true"
    />
  </DataTable>
</template>

<script>
export default {
  name: `table-balances`,
  props: {
    balances: {
      type: Array,
      required: true,
    },
    totalRewardsPerDenom: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    sort: {
      property: `id`,
      order: `desc`,
    },
  }),
  computed: {
    properties() {
      return [
        {
          title: `Total`,
          value: `total`,
        },
        {
          title: `Rewards`,
          value: `rewards`,
        },
        {
          title: `Available`,
          value: `available`,
        },
        {
          title: ``,
          value: `actions`,
        },
      ]
    },
  },
}
</script>
