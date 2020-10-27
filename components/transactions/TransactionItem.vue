<template>
  <div class="tx-container">
    <div class="tx" @click="toggleDetail">
      <component
        :is="messageTypeComponent"
        :transaction="transaction"
        :validators="validators"
        :session-address="address"
        :show="show"
      />
      <div class="toggle" :class="{ up: show }">
        <i class="material-icons notranslate toggle-icon"
          >keyboard_arrow_down</i
        >
      </div>
    </div>
    <transition name="slide-out">
      <div v-if="show" class="tx-details">
        <TransactionMetadata v-if="showMetaData" :transaction="transaction" />
      </div>
    </transition>
  </div>
</template>

<script>
import messageViews from './message-views'
import { lunieMessageTypes } from '~/common/lunie-message-types'

export default {
  name: `tx-item`,
  // need to be explicit here as the dynamic import doesn't seem to work for autoimporting the components by nuxt
  components: {
    ...messageViews,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    validators: {
      type: Object,
      required: true,
    },
    address: {
      type: String,
      default: null,
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
    messageTypeComponent() {
      switch (this.transaction.type) {
        case lunieMessageTypes.SEND:
          return `send-tx-details`
        case lunieMessageTypes.STAKE:
          return `stake-tx-details`
        case lunieMessageTypes.UNSTAKE:
          return `unstake-tx-details`
        case lunieMessageTypes.UNKNOWN:
          return `unknown-tx-details`
        /* istanbul ignore next */
        default:
          return ``
      }
    },
  },
  methods: {
    toggleDetail(event) {
      if (event.target.className !== `address`) {
        this.show = !this.show
      }
    },
  },
}
</script>

<style>
.tx {
  position: relative;
  font-size: 14px;
  display: flex;
  align-items: center;
  background: var(--app-fg);
  border: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
  z-index: 90;
  cursor: pointer;
}

.tx a {
  display: inline-block;
}

.validator-image {
  margin: 0.25rem;
  border-radius: 100%;
  height: 1.25rem;
  width: 1.25rem;
  vertical-align: middle;
  transition: transform 0.2s ease-in-out;
}

.validator-image svg {
  border-radius: 100%;
}

.tx a:hover .validator-image {
  transform: scale(1.1);
}

.tx h3 {
  font-size: 14px;
  font-weight: 400;
  color: var(--bright);
}

.tx .amount {
  white-space: nowrap;
}

.tx-container {
  margin: 0 1rem 0.5rem;
}

.tx-details {
  background: var(--app-fg);
  border-left: 1px solid var(--bc-dim);
  border-right: 1px solid var(--bc-dim);
  border-bottom: 1px solid var(--bc-dim);
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  margin: 0 1rem 0.5rem 1rem;
  font-size: 14px;
  padding: 1rem;
  position: relative;
  z-index: 0;
}

.tx__content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 90;
  width: 100%;
}

.tx__content__left {
  padding: 1rem 1rem 1rem 0;
}

.tx__content__right {
  padding-right: 2rem;
  text-align: right;
  flex: auto;
}

.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 0.2s;
}

.slide-out-enter,
.slide-out-leave-to {
  opacity: 0;
  transform: translateY(-100px);
  margin-bottom: -100px;
}

.toggle {
  position: relative;
  right: 1rem;
  z-index: 91;
  cursor: pointer;
  padding: 0.1rem;
  border-radius: 50%;
  background: var(--bc-dim);
  height: 20px;
  width: 20px;
  transition: transform 0.2s ease;
}

.toggle.up {
  transform: rotate(180deg);
}

.toggle-icon {
  font-size: 16px;
}

.tx .copied {
  position: absolute;
  top: -0.5rem;
  right: 0;
}

@media screen and (max-width: 767px) {
  .tx__icon {
    display: none;
  }

  .tx__content__left {
    padding-left: 1rem;
  }

  .toggle {
    display: none;
  }

  .amount {
    position: absolute;
    right: 1rem;
    top: 1rem;
  }

  .tx-details {
    margin: 0 0.25rem 0.25rem;
  }

  .validator-image {
    height: 1rem;
    width: 1rem;
  }
}
</style>
