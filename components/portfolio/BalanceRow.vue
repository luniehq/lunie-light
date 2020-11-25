<template>
  <tr class="balance-row">
    <td :key="balance.denom">
      <div class="row">
        <div
          class="token-icon"
          :style="{
            backgroundImage: `url(${image})`,
            backgroundColor: hex,
          }"
        />
        <div class="total">
          {{ balance.total | bigFigureOrShortDecimals }}
          {{ balance.denom }}
        </div>
        <div v-if="balance.sourceChain" class="chain">
          {{ balance.sourceChain }}
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
        <button class="icon-button" @click="$emit('open-send-modal')">
          <i class="material-icons">send</i></button
        ><span>Send</span>
      </div>
      <div v-if="stake" class="icon-button-container">
        <button class="icon-button" @click="$emit('open-stake-modal')">
          <i class="material-icons">arrow_upward</i></button
        ><span>Stake</span>
      </div>
      <div v-if="unstake" class="icon-button-container">
        <button class="icon-button" @click="$emit('open-unstake-modal')">
          <i class="material-icons">arrow_downward</i></button
        ><span>Unstake</span>
      </div>
    </td>
  </tr>
</template>
<script>
import { bigFigureOrShortDecimals } from '~/common/numbers'
import { fromNow } from '~/common/time'
import network from '~/common/network'

export default {
  name: `BalanceRow`,
  filters: {
    bigFigureOrShortDecimals,
    fromNow,
  },
  props: {
    balances: {
      type: Array,
      required: true,
    },
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
      const coinLookup = network.getCoinLookup(this.balance.denom, 'viewDenom')
      return coinLookup ? coinLookup.icon : undefined
    },
    hex() {
      const string = this.balance.denom
      let hash = 0
      for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash)
      }
      let colour = '#'
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF // prettier-ignore
        colour += ('00' + value.toString(16)).substr(-2)
      }
      return this.image ? '' : colour
    },
  },
  methods: {
    bigFigureOrShortDecimals,
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

.chain {
  font-size: 10px;
  margin-left: 0.5rem;
  margin-top: 0.3rem;
}

.token-icon {
  width: 2.5rem;
  height: 2.5rem;
  max-width: 100%;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 50%;
  background-size: cover;
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
