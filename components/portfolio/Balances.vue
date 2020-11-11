<template>
  <div class="table-container">
    <h1>Your Balances</h1>
    <TableContainer
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
    </TableContainer>

    <LazySendModal ref="SendModal" :denoms="getAllDenoms" />
    <!-- <ModalWithdrawRewards ref="ModalWithdrawRewards" />
      <StakeModal ref="StakeModal" />
      <UnstakeModal ref="UnstakeModal" /> -->
  </div>
</template>
<script>
import network from '../../network'

export default {
  name: `Balances`,
  props: {
    balances: {
      type: Array,
      default: () => [],
    },
    rewards: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    sort: {
      property: `id`,
      order: `desc`,
    },
  }),
  computed: {
    // readyToWithdraw() {
    //   return Object.values(this.totalRewardsPerDenom).find((value) => value > 0)
    // },
    getAllDenoms() {
      if (this.balances.length > 0) {
        const balances = this.balances
        return balances.map(({ denom }) => denom)
      } else {
        return [network.stakingDenom]
      }
    },
    totalRewardsPerDenom() {
      return this.rewards.reduce((all, reward) => {
        return {
          ...all,
          [reward.denom]: parseFloat(reward.amount) + (all[reward.denom] || 0),
        }
      }, {})
    },
    totalRewards() {
      return this.totalRewardsPerDenom[network.stakingDenom] || 0
    },
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
  methods: {
    onWithdrawal() {
      this.$refs.ModalWithdrawRewards.open()
    },
    onSend(denom = undefined) {
      this.$refs.SendModal.open(denom)
    },
    onStake(amount) {
      this.$refs.StakeModal.open()
    },
    onUnstake(amount) {
      this.$refs.UnstakeModal.open()
    },
  },
}
</script>
<style scoped>
.table-container {
  width: 100%;
  padding: 3rem 6rem;
  margin: 0 auto;
}

.icon-button-container {
  margin-right: 1rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  min-width: 3rem;
}

.icon-button-container span {
  display: block;
  font-size: var(--text-xs);
  text-align: center;
  color: var(--dim);
  padding-top: 2px;
}

.icon-button {
  border-radius: 50%;
  background: var(--primary);
  border: none;
  outline: none;
  height: 2rem;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.25s ease;
}

.icon-button:hover {
  background: var(--primary-hover);
  cursor: pointer;
}

.icon-button i {
  font-size: 14px;
  color: var(--white);
  font-weight: 900;
}

@media screen and (max-width: 1023px) {
  .table-container {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

@media screen and (max-width: 667px) {
  .table-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
