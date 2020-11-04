<template>
  <div class="tx-container">
    <a
      class="transaction"
      :href="network.apiURL + '/txs/' + transaction.hash"
      target="_blank"
    >
      <div class="left">
        <img
          class="icon"
          :src="
            require(`../../assets/images/transactions/${transactionType}.svg`)
          "
          alt="simple icon line drawing"
        />
        <div class="title-and-images">
          <div>
            <h3>{{ transactionType }}</h3>
            <template v-if="transactionType === `Send`">
              <p
                v-for="(address, index) in transaction.details.to"
                :key="address + index"
              >
                {{ address }}
              </p>
            </template>
            <template v-if="transactionType === `Receive`">
              <p
                v-for="(address, index) in transaction.details.from"
                :key="address + index"
              >
                {{ address }}
              </p>
            </template>
          </div>
          <div v-if="includesValidatorAddresses" class="validator-images">
            <template v-for="(address, index) in transaction.details.from">
              <Avatar
                :key="index + '_from_avatar'"
                class="validator-image"
                alt="placeholder color for validator image"
                :address="address"
                @click.prevent.self
                @click="$router.push(`/validators/${address}`)"
              />
            </template>
            <template v-for="(address, index) in transaction.details.to">
              <Avatar
                :key="index + '_to_avatar'"
                class="validator-image"
                alt="placeholder color for validator image"
                :address="address"
                @click.prevent.self
                @click="$router.push(`/validators/${address}`)"
              />
            </template>
          </div>
        </div>
      </div>
      <div class="right">
        <div v-if="amounts" class="amounts">
          <p v-for="(item, index) in amounts" :key="index">
            {{ item.amount }}
            {{ item.denom }}
          </p>
        </div>
        <div class="launch">
          <i class="material-icons notranslate launch-icon">launch</i>
        </div>
      </div>
    </a>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `transaction`,
  props: {
    transaction: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    network,
  }),
  computed: {
    ...mapState(['session']),
    transactionType() {
      switch (this.transaction.type) {
        case lunieMessageTypes.SEND:
          if (this.transaction.details.to.includes(this.session.address)) {
            return 'Receive'
          } else {
            return 'Send'
          }
        case lunieMessageTypes.STAKE:
          return `Stake`
        case lunieMessageTypes.RESTAKE:
          return `Restake`
        case lunieMessageTypes.UNSTAKE:
          return `Unstake`
        case lunieMessageTypes.DEPOSIT:
          return `Deposit`
        case lunieMessageTypes.VOTE:
          return `Vote`
        case lunieMessageTypes.CLAIM_REWARDS:
          return `Claim Rewards`
        case lunieMessageTypes.UNKNOWN:
          return `Unknown`
        /* istanbul ignore next */
        default:
          return ``
      }
    },
    includesValidatorAddresses() {
      return !!(
        this.transactionType === `Stake` ||
        this.transactionType === `Unstake` ||
        this.transactionType === `Restake` ||
        this.transactionType === `Claim Rewards`
      )
    },
    amounts() {
      if (this.transaction.details.amounts) {
        return this.transaction.details.amounts
      } else if (this.transaction.details.amount) {
        return [this.transaction.details.amount]
      }
      return null
    },
  },
}
</script>

<style scoped>
.transaction {
  position: relative;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-fg);
  border-radius: 0.25rem;
  z-index: 90;
  padding: 1.5rem 1rem;
  margin: 1rem 1rem 0 1rem;
  cursor: pointer;
}

.icon {
  height: 2.75rem;
  width: 2.75rem;
  display: inline-flex;
}

.transaction:hover {
  background: var(--app-fg-hover);
}

.left {
  display: flex;
  flex-direction: row;
}

.title-and-images {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-and-images p {
  color: var(--txt);
  padding: 0 2rem 0 1rem;
  font-size: 12px;
  word-break: break-all;
}

.validator-images {
  padding: 0 0 0 1rem;
  display: inline-flex;
}

.right {
  display: flex;
  flex-direction: row;
  align-items: center;
}

h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--dim);
  padding-left: 1rem;
}

.amounts p {
  color: var(--txt);
}

.validator-image {
  height: 1.25rem;
  width: 1.25rem;
  margin: 0 0.5rem 0 0;
  border-radius: 50%;
}

.launch {
  z-index: 91;
  cursor: pointer;
  border-radius: 50%;
  background: var(--bc-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
  transition: transform 0.2s ease;
  margin-left: 1rem;
}

.launch i {
  font-size: 16px;
  position: relative;
  color: var(--link);
  top: 1px;
}

@media screen and (max-width: 767px) {
  .title-and-images {
    flex-direction: column;
    align-items: start;
  }

  .title-and-images p {
    padding-left: 0;
  }

  h3 {
    padding-left: 0;
  }

  .amounts {
    text-align: right;
  }

  .validator-images {
    padding: 0.5rem 0 0 0;
  }

  .icon {
    display: none;
  }

  .launch {
    display: none;
  }
}
</style>
