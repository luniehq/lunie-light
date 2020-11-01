<template>
  <div class="balance-row">
    <div :key="balance.denom" class="table-cell big">
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

    <div
      v-if="!unstakingBalance"
      :key="balance.denom + '_rewards'"
      class="table-cell rewards"
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
    </div>

    <div
      v-if="!unstakingBalance"
      :key="balance.denom + '_available'"
      class="table-cell available"
    >
      <span v-if="balance.type === 'STAKE'" class="available-amount">
        {{ balance.available | bigFigureOrShortDecimals }}
      </span>
    </div>

    <div
      v-if="!unstakingBalance"
      :key="balance.denom + '_actions'"
      class="table-cell actions"
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
    </div>

    <LazySendModal ref="SendModal" :denoms="[balance.denom]" />
    <!-- <StakeModal ref="StakeModal" />
    <UnstakeModal ref="UnstakeModal" /> -->
  </div>
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
  display: flex;
}

.balance-row:not(:first-child) {
  margin-top: -1px;
}

.balance-row:not(:last-child) {
  border-bottom: 1px solid var(--bc);
}

.table-cell {
  flex-grow: 1;
  padding: 0.75rem 0.75rem 0.75rem 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  width: 20%;
  position: relative;
  white-space: nowrap;
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

.table-cell.big {
  width: 40%;
  padding-left: 1rem;
}

.table-cell.big.title {
  padding-left: 0;
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
  font-size: 12px;
  text-align: center;
  color: var(--dim);
  padding-top: 2px;
}

.icon-button {
  border-radius: 50%;
  background: var(--link);
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
  background: var(--link-hover);
  cursor: pointer;
}

.icon-button i {
  font-size: 14px;
  color: var(--menu-bright);
  font-weight: 900;
}

@media screen and (max-width: 667px) {
  .available {
    display: none;
  }

  .table {
    padding: 1rem;
  }

  .table-cell {
    width: 40%;
  }

  .table-cell.big {
    width: 60%;
  }

  .rewards {
    font-size: 12px;
  }

  .endtime {
    font-size: 12px;
  }
}

@media screen and (min-width: 1254px) {
  .button.send-button {
    display: none;
  }
}

@media screen and (max-width: 1254px) {
  .actions {
    display: none;
  }
}
</style>
