<template>
  <div class="tx-container">
    <div class="transaction" @click="toggleDetail">
      <h3>{{ txLabel }}</h3>
      <div class="right">
        <div class="amounts">
          <template v-if="transaction.details.amounts">
            <p
              v-for="(amount, index) in transaction.details.amounts"
              :key="index + amount"
            >
              {{ amount.amount }}
              {{ amount.denom }}
            </p>
          </template>
          <template v-if="transaction.details.amount">
            <p>
              {{ transaction.details.amount.amount }}
              {{ transaction.details.amount.denom }}
            </p>
          </template>
        </div>
        <div class="toggle" :class="{ up: show }">
          <i class="material-icons notranslate toggle-icon"
            >keyboard_arrow_down</i
          >
        </div>
      </div>
    </div>
    <transition name="slide-out">
      <div v-if="show" class="meta">
        <p v-if="transaction.hash">Tx Hash: {{ transaction.hash }}</p>
        <p v-if="transaction.height">Block Height: {{ transaction.height }}</p>
        <p v-if="transaction.timestamp">Date: {{ timestamp }}</p>
        <p v-if="transaction.memo">Memo: {{ transaction.memo }}</p>
        <p
          v-for="(amount, index) in transaction.fees"
          :key="index + transaction.timestamp"
        >
          Fee: {{ amount.amount }}&nbsp;{{ amount.denom }}
        </p>
        <div class="addresses">
          <p
            v-for="(address, index) in transaction.details.to"
            :key="index + transaction.hash"
          >
            To: {{ getValidatorName(address) }}
          </p>
          <p
            v-for="(address, index) in transaction.details.from"
            :key="index + transaction.height"
          >
            From: {{ getValidatorName(address) }}
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: `transaction`,
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    showMetaData: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    show: false,
  }),
  computed: {
    ...mapState('data', ['validators']),
    txLabel() {
      const typeWithoutSuffix = this.transaction.type.replace('Tx', '')
      const typeWithSpaces = typeWithoutSuffix.replace(/([A-Z])/g, ' $1').trim()
      return typeWithSpaces
    },
    timestamp() {
      return dayjs(this.transaction.timestamp)
    },
  },
  methods: {
    toggleDetail(event) {
      if (event.target.className !== `address`) {
        this.show = !this.show
      }
    },
    getValidatorName(address) {
      if (address.includes('valoper')) {
        const validator = this.validators.find(
          (validator) => validator.operatorAddress === address
        )
        return validator.name + ' (' + address + ')'
      }
      return address
    },
  },
}
</script>

<style>
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

.transaction:hover {
  background: var(--app-fg-hover);
}

.right {
  display: flex;
  flex-direction: row;
}

h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--bright);
}

.meta {
  background: var(--app-fg);
  border-left: 1px solid var(--bc-dim);
  border-right: 1px solid var(--bc-dim);
  border-bottom: 1px solid var(--bc-dim);
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  margin: 0 auto 0.5rem auto;
  font-size: 14px;
  padding: 1rem;
  position: relative;
  z-index: 0;
  width: 95%;
  word-break: break-all;
}

.addresses {
  padding-top: 1rem;
}

.toggle {
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

.toggle i {
  font-size: 16px;
  position: relative;
  top: 1px;
}

.toggle.up {
  transform: rotate(180deg);
}

.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 0.1s;
}

.slide-out-enter,
.slide-out-leave-to {
  opacity: 0;
  transform: translateY(-120px);
  margin-bottom: -120px;
}

@media screen and (max-width: 767px) {
  .toggle {
    display: none;
  }

  .meta {
    width: 90%;
  }
}
</style>
