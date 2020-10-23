<template>
  <div class="delegations-overview">
    <div class="table-container">
      <div v-if="delegations.length > 0 || stakedBalance.total > 0">
        <h1>Your Stake</h1>
        <BalanceRow
          v-if="stakedBalance.total > 0"
          :balance="stakedBalance"
          :total-rewards-per-denom="totalRewardsPerDenom"
        />
        <TableValidators
          v-if="delegations.length > 0"
          :validators="delegations.map(({ validator }) => validator)"
          :delegations="delegations"
          class="table-validators"
          show-on-mobile="expectedReturns"
        />
      </div>
      <TmDataMsg v-if="delegations.length === 0" icon="sentiment_dissatisfied">
        <div slot="title">No validators in your portfolio</div>
        <div slot="subtitle">
          Head over to the
          <a @click="goToValidators()">validator list</a>&nbsp;to
          {{
            stakedBalance.total > 0 ? `start earning rewards` : `get staking`
          }}!
        </div>
      </TmDataMsg>
      <!-- <UnstakeModal ref="UnstakeModal" /> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '../../network'

export default {
  name: `delegations-overview`,
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
  mounted() {
    const persistedPreferredCurrency = this.session.preferredCurrency
    if (persistedPreferredCurrency) {
      this.preferredCurrency = persistedPreferredCurrency
    }
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
h1 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
  padding-bottom: 2rem;
}

.delegations-overview {
  background: var(--app-fg);
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 4rem 2rem;
}

.table-validators {
  margin-top: 2rem;
}

.tm-form-msg--desc {
  padding-bottom: 1rem;
}

.tm-data-msg {
  margin-top: 1rem;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }

  .loading-image-container {
    padding: 2rem;
  }

  .table-container {
    padding: 4rem 1rem;
  }
}
</style>
