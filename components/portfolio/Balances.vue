<template>
  <div class="balances-container">
    <div class="balances">
      <div class="header">
        <h1>Your Balances</h1>
        <div class="buttons">
          <TmBtn
            class="send-button"
            value="Send"
            type="secondary"
            @click.native="onSend()"
          />
          <!-- <TmBtn
            :disabled="!readyToWithdraw"
            class="withdraw-rewards"
            value="Claim Rewards"
            @click.native="readyToWithdraw && onWithdrawal()"
          /> -->
        </div>
      </div>

      <TableBalances
        :balances="balances"
        :total-rewards-per-denom="totalRewardsPerDenom"
      />

      <LazySendModal ref="SendModal" :denoms="getAllDenoms" />
      <!-- <ModalWithdrawRewards ref="ModalWithdrawRewards" />
      <StakeModal ref="StakeModal" />
      <UnstakeModal ref="UnstakeModal" /> -->
    </div>
  </div>
</template>
<script>
import network from '../../network'

export default {
  name: `balances`,
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
.balances-container {
  width: 100%;
  background: var(--app-bg);
}

.balances {
  margin: 0 auto;
  max-width: 1100px;
  padding: 1.5rem 1rem;
}

.header {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 1.5rem 2rem 1rem;
  width: 100%;
}

.header h1 {
  padding-bottom: 0;
}

.header button:last-child {
  margin-left: 0.5rem;
}

.buttons {
  display: flex;
  align-items: center;
}

@media screen and (max-width: 667px) {
  .header {
    flex-direction: column;
    padding: 0 1rem;
  }
}

@media screen and (min-width: 1254px) {
  .stake-button,
  .unstake-button,
  .button.send-button {
    display: none;
  }
}
</style>
