<template>
  <tr class="balance-row">
    <td :key="balance.denom">
      <div class="row">
        <img
          class="token-icon"
          :src="image"
          :alt="`${balance.denom}` + ' currency'"
        />
        <div class="total">
          {{ balance.total | bigFigureOrShortDecimals }}
          {{ balance.denom }}
        </div>
      </div>
    </td>

    <td
      v-if="!unstakingBalance"
      :key="balance.denom + '_rewards'"
      class="rewards"
    >
      <h2
        v-if="
          totalRewardsPerDenom && totalRewardsPerDenom[balance.denom] > 0.001
        "
      >
        +{{ totalRewardsPerDenom[balance.denom] | bigFigureOrShortDecimals }}
        {{ balance.denom }}
      </h2>
      <h2 v-else-if="!unstake">0</h2>
    </td>

    <td
      v-if="!unstakingBalance"
      :key="balance.denom + '_available'"
      class="available"
    >
      <span v-if="balance.type === 'STAKE'" class="available-amount">
        {{ balance.available | bigFigureOrShortDecimals }}
      </span>
    </td>

    <td
      v-if="!unstakingBalance"
      :key="balance.denom + '_actions'"
      class="actions"
    >
      <div v-if="send" class="icon-button-container">
        <button class="icon-button" @click="onSend(balance.denom)">
          <i class="material-icons">send</i></button
        ><span>Send</span>
      </div>
      <div v-if="stake" class="icon-button-container">
        <button class="icon-button" @click="onStake(balance.denom)">
          <i class="material-icons">arrow_upward</i></button
        ><span>Stake</span>
      </div>
      <div v-if="unstake" class="icon-button-container">
        <button class="icon-button" @click="onUnstake(balance.denom)">
          <i class="material-icons">arrow_downward</i></button
        ><span>Unstake</span>
      </div>
    </td>

    <LazySendModal ref="SendModal" :denoms="[balance.denom]" />
    <!-- <StakeModal ref="StakeModal" />
    <UnstakeModal ref="UnstakeModal" /> -->
  </tr>
</template>
<script>
import { bigFigureOrShortDecimals } from '~/common/numbers'
import { fromNow } from '~/common/time'

export default {
  name: `balance-row`,
  filters: {
    bigFigureOrShortDecimals,
    fromNow,
  },
  props: {
    balance: {
      type: Object,
      required: true,
    },
    totalRewardsPerDenom: {
      type: Object,
      default: () => {},
    },
    stake: {
      type: Boolean,
      default: false,
    },
    unstake: {
      type: Boolean,
      default: false,
    },
    send: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    unstakingBalance() {
      return !!this.balance.endTime
    },
    image() {
      const fileName = this.balance.denom.toLowerCase() + '.png'
      return require(`../../assets/images/currencies/${fileName}`)
    },
  },
  methods: {
    bigFigureOrShortDecimals,
    onSend(denom = undefined) {
      this.$refs.SendModal.open(denom)
    },
    onStake(amount) {
      this.$refs.StakeModal.open()
    },
    onUnstake() {
      this.$refs.UnstakeModal.open()
    },
  },
}
</script>
<style scoped>
.balance-row {
  border-bottom: 1px solid var(--bc-dim);
}

.balance-row:not(:first-child) {
  margin-top: -1px;
}

.balance-row:not(:last-child) {
  border-bottom: 1px solid var(--bc-dim);
}

td {
  padding: 0.5rem 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  vertical-align: middle;
}

.row {
  display: flex;
  align-items: center;
  min-width: 12rem;
}

.rewards {
  color: var(--success);
}

.total {
  color: var(--bright);
}

.token-icon {
  width: 2.5rem;
  height: 2.5rem;
  max-width: 100%;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 50%;
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
  font-size: 10px;
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
</style>
