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
          :src="require(`../../assets/images/transactions/${txLabel}.svg`)"
          alt="simple icon line drawing"
        />
        <div class="title-and-images">
          <h3>{{ txLabel }}</h3>
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
    txLabel() {
      const typeWithoutSuffix = this.transaction.type.replace('Tx', '')
      const typeWithSpaces = typeWithoutSuffix.replace(/([A-Z])/g, ' $1').trim()
      return typeWithSpaces
    },
    includesValidatorAddresses() {
      return !!(
        this.txLabel === `Stake` ||
        this.txLabel === `Unstake` ||
        this.txLabel === `Restake` ||
        this.txLabel === `Claim Rewards`
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

  h3 {
    padding-left: 0;
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
