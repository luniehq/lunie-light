<template>
  <div class="balance-header-container">
    <div class="balance-header">
      <div class="header-container">
        <h1>Your Balances</h1>
        <div class="buttons">
          <TmBtn
            class="send-button"
            value="Send"
            type="secondary"
            @click.native="onSend()"
          />
          <TmBtn
            id="withdraw-btn"
            :disabled="!readyToWithdraw"
            class="withdraw-rewards"
            value="Claim Rewards"
            @click.native="readyToWithdraw && onWithdrawal()"
          />
          <!-- <div class="currency-selector">
            <img
              v-if="preferredCurrency"
              class="currency-flag"
              :src="
                '/img/icons/currencies/' +
                preferredCurrency.toLowerCase() +
                '.png'
              "
              :alt="`${preferredCurrency}` + ' currency'"
            />
            <select
              v-model="preferredCurrency"
              @change="setPreferredCurrency()"
            >
              <option
                v-if="preferredCurrency"
                value=""
                :selected="preferredCurrency"
                hidden
              >
                {{ preferredCurrency }}
              </option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CAD">CAD</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CHF">CHF</option>
              <option value="DKK">DKK</option>
              <option value="NOK">NOK</option>
              <option value="SEK">SEK</option>
            </select>
          </div> -->
        </div>
      </div>

      <TableBalances
        :balances="balances"
        :total-rewards-per-denom="totalRewardsPerDenom"
      />

      <!-- <SendModal ref="SendModal" :denoms="getAllDenoms" />
      <ModalWithdrawRewards ref="ModalWithdrawRewards" />
      <DelegationModal ref="StakeModal" />
      <UndelegationModal ref="UnstakeModal" /> -->
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { noBlanks } from '../../common/strings'
import network from '../../network'
import CosmosV2Source from '../../common/cosmosV2-source'

export default {
  name: `tm-balance`,
  filters: {
    noBlanks,
  },
  data() {
    return {
      balances: [],
      rewards: [],
      preferredCurrency: 'USD',
    }
  },
  computed: {
    ...mapState([`session`, `address`]),
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return Object.values(this.totalRewardsPerDenom).find((value) => value > 0)
    },
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
  },
  watch: {
    totalRewards(totalRewards) {
      if (this.rewards && !this.rewardsSentToGA) {
        this.sendRewards(totalRewards)
      }
    },
  },
  mounted() {
    this.loadData(this)

    const persistedPreferredCurrency = this.session.preferredCurrency
    if (persistedPreferredCurrency) {
      this.preferredCurrency = persistedPreferredCurrency
    }
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
    setPreferredCurrency() {
      this.$store.dispatch(`setPreferredCurrency`, this.preferredCurrency)
    },
    sendRewards(totalRewards) {
      this.rewardsSentToGA = true
    },
    async loadData({ $axios, $route: { params } }) {
      const store = {}
      const api = new CosmosV2Source($axios, network, store, null, null)
      const [balances, rewards] = await Promise.all([
        api.getBalancesV2FromAddress(
          params.address,
          'USD', // this.preferredCurrency,
          network
        ),
        api.getRewards(params.address, 'USD', network),
      ])
      return Object.assign(this, { balances, rewards })
    },
  },
  async asyncData({ $axios, params }) {
    const store = {}
    const api = new CosmosV2Source($axios, network, store, null, null)
    const [balances, rewards] = await Promise.all([
      api.getBalancesV2FromAddress(
        params.address,
        'USD', // this.preferredCurrency,
        network
      ),
      api.getRewards(params.address, 'USD', network),
    ])
    return { balances, rewards }
  },
}
</script>
<style scoped>
.balance-header-container {
  width: 100%;
  background: var(--app-bg);
}

.balance-header {
  margin: 0 auto;
  max-width: 1100px;
}

.loading-image-container {
  padding: 0 2rem 2rem;
}

h1 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
}

select {
  background: var(--input-bg);
  color: var(--txt);
  border: none;
}

select option {
  background: var(--app-bg);
  color: var(--txt);
  font-family: var(--sans);
}

.currency-selector {
  float: right;
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--primary);
  border-radius: 0.5rem;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--bright);
}

.currency-selector img {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.currency-flag {
  width: 2.5rem;
  height: 2.5rem;
  max-width: 100%;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 50%;
}

.currency-div {
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--bc-dim);
}

.currency-div:last-child {
  border-bottom: none;
}

.currency-div:hover {
  background: var(--app-fg-hover);
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

.reward-bar {
  width: auto;
  margin: 0 2rem;
}

@media screen and (max-width: 667px) {
  h1 {
    padding-bottom: 2rem;
  }

  .header-container {
    flex-direction: column;
    padding: 0 1rem;
  }

  .currency-selector {
    display: none;
  }

  .reward-bar {
    margin: 2rem 2rem;
  }
}

@media screen and (min-width: 1254px) {
  .stake-button,
  .unstake-button,
  .send-button {
    display: none;
  }
}
</style>
