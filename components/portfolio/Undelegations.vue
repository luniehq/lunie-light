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
h1 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
  padding: 1rem 0 2rem;
}

.undelegations {
  background: var(--app-fg);
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 0 2rem 8rem;
}

.balance-row {
  display: flex;
}

.header-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem 2rem 2rem;
  width: 100%;
}

.header-container button {
  margin-right: 0.5rem;
}

.buttons {
  display: flex;
  align-items: center;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }

  .table-container {
    padding: 0 1rem 8rem;
  }

  .header-container {
    flex-direction: column;
    padding: 0 1rem 1rem 0;
  }
}
</style>
