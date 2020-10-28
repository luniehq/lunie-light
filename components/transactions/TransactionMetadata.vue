<template>
  <div class="tx__metadata">
    <div class="meta-left">
      <p>
        Block
        <span>#{{ transaction.height | prettyInt }}</span>
        &nbsp;<i class="material-icons notranslate">access_time</i>&nbsp;{{
          date
        }}
      </p>
      <p v-if="transaction.memo">
        Memo:&nbsp;
        {{ transaction.memo }}
      </p>
      <p>
        Fees:&nbsp;
        <span v-if="transaction.fees.length > 0">
          <b>{{ transaction.fees[0].amount }}</b>
          <span> {{ transaction.fees[0].denom }}</span>
        </span>
        <span v-else> 0 </span>
      </p>
      <p class="hash-container">
        Hash: <span class="hash">{{ transaction.hash }}</span>
      </p>
    </div>
    <div
      v-if="
        transaction.details.amounts && transaction.details.amounts.length > 1
      "
      class="meta-right"
    >
      <div v-for="amount in transaction.details.amounts" :key="amount.denom">
        {{ amount.amount }} {{ amount.denom }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { prettyInt } from '~/common/numbers'

export default {
  name: `transaction-metadata`,
  filters: {
    prettyInt,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
  },
  computed: {
    date() {
      const momentTime = moment(this.transaction.timestamp)
      return momentTime.format(`HH:mm:ss`)
    },
  },
}
</script>
<style scoped>
.tx__metadata {
  display: flex;
  justify-content: space-between;
}

.material-icons {
  font-size: 1rem;
  vertical-align: middle;
  margin-bottom: 2px;
}

.hash-container {
  max-width: 420px;
}

.hash {
  color: var(--dim);
  word-break: break-all;
}

@media screen and (max-width: 767px) {
  .tx__metadata {
    flex-direction: column;
  }

  .meta-right {
    padding-top: 1rem;
  }
}
</style>
