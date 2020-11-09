<template>
  <div v-if="undelegations.length > 0" class="undelegations">
    <div class="table-container">
      <div class="header-container">
        <h1>Unstaking</h1>
      </div>
      <TableUndelegations :undelegations="undelegations" />
    </div>
    <!-- <ModalWithdrawUnstaked ref="WithdrawModal" /> -->
  </div>
</template>

<script>
import network from '../../network'

export default {
  name: `undelegations`,
  props: {
    undelegations: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    balances() {
      return this.undelegations.map((undelegation) => {
        return {
          ...undelegation,
          total: undelegation.amount,
          denom: network.stakingDenom,
        }
      })
    },
    readyUndelegations() {
      const now = new Date()
      return !!this.undelegations.find(({ endTime }) => {
        return new Date(endTime) <= now
      })
    },
  },
  methods: {
    onWithdraw() {
      this.$refs.WithdrawModal.open()
    },
  },
}
</script>
<style scoped>
.undelegations {
  background: var(--app-fg);
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 0 3rem 4rem;
}

.header-container button {
  margin-right: 0.5rem;
}

.buttons {
  display: flex;
  align-items: center;
}

@media screen and (max-width: 667px) {
  .table-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
