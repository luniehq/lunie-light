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
      <!-- <UndelegationModal ref="UnstakeModal" /> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '../../network'
import CosmosV2Source from '../../common/cosmosV2-source'

export default {
  name: `delegations-overview`,
  data: () => ({
    delegations: [],
    balances: [],
    rewards: [],
    delegationsLoaded: false,
    preferredCurrency: 'USD',
  }),
  computed: {
    ...mapState([`session`, `address`]),
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
    this.loadData(this)

    const persistedPreferredCurrency = this.session.preferredCurrency
    if (persistedPreferredCurrency) {
      this.preferredCurrency = persistedPreferredCurrency
    }
  },
  // TODO load data only once in page portfolio and pass on
  async asyncData({ $axios, params }) {
    const store = {}
    const api = new CosmosV2Source($axios, network, store, null, null)
    const [delegations, balances, rewards] = await Promise.all([
      api.getDelegationsForDelegatorAddress(params.address),
      api.getBalancesV2FromAddress(
        params.address,
        'USD', // this.preferredCurrency,
        network
      ),
      api.getRewards(params.address, 'USD', network),
    ])
    return { delegations, balances, rewards }
  },
  methods: {
    goToValidators() {
      this.$router.push('/validators')
    },
    openUnstakeModal() {
      this.$refs.UnstakeModal.open()
    },
    async loadData({ $axios, $cookies }) {
      const address = $cookies.get('address')
      const currency = $cookies.get('currency') || 'USD'
      const store = {}
      const api = new CosmosV2Source($axios, network, store, null, null)
      const [delegations, balances, rewards] = await Promise.all([
        api.getDelegationsForDelegatorAddress(address),
        api.getBalancesV2FromAddress(address, currency, network),
        api.getRewards(address, currency, network),
      ])
      return Object.assign(this, { delegations, balances, rewards })
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
