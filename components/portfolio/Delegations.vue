<template>
  <div class="table-container">
    <div v-if="delegations.length > 0 || stakedBalance.total > 0">
      <h1>Your Stake</h1>
      <BalanceRow
        v-if="stakedBalance.total > 0"
        :balance="stakedBalance"
        :total-rewards-per-denom="totalRewardsPerDenom"
      />
      <TableValidators
        :validators="delegations.map(({ validator }) => validator)"
        :delegations="delegations"
        class="table-validators"
      />
    </div>

    <Card v-else-if="delegations.length === 0">
      <div slot="title">No validators in your portfolio</div>
      <div slot="subtitle">
        Head over to the
        <a @click="goToValidators()">validator list</a>&nbsp;to start staking.
      </div>
    </Card>
    <!-- <UnstakeModal ref="UnstakeModal" /> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '../../network'

export default {
  name: `Delegations`,
  props: {
    balances: {
      type: Array,
      default: () => [],
    },
    rewards: {
      type: Array,
      default: () => [],
    },
    delegations: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    preferredCurrency: 'USD',
  }),
  computed: {
    ...mapState([`session`]),
    stakedBalance() {
      // balances not loaded yet
      if (!this.balances.length) {
        return {
          total: 0,
          denom: network.stakingDenom,
        }
      }
      const stakingDenomBalance = this.balances.find(
        ({ denom }) => denom === network.stakingDenom
      )
      return {
        total: stakingDenomBalance
          ? Number(stakingDenomBalance.staked).toFixed(3)
          : 0,
        denom: network.stakingDenom,
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
  },
  methods: {
    goToValidators() {
      this.$router.push('/validators')
    },
    openUnstakeModal() {
      this.$refs.UnstakeModal.open()
    },
  },
}
</script>
<style scoped>
.table-container {
  margin: 0 auto;
  width: 100%;
  padding: 3rem 6rem;
  background: var(--gray-200);
}

.tm-form-msg--desc {
  padding-bottom: 1rem;
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
