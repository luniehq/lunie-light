<template>
  <div class="balances-container">
    <div class="balances">
      <div class="header">
        <h1>Your Balances</h1>
        <div class="buttons">
          <div class="icon-button-container send-button">
            <button class="icon-button" @click="onSend()">
              <i class="material-icons">send</i></button
            ><span>Send</span>
          </div>
          <!-- <Button
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
  color: var(--menu-bright);
  font-weight: 900;
}

@media screen and (max-width: 667px) {
  .header {
    padding: 0 0 3rem;
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
