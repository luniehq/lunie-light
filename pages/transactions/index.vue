<template>
  <div>
    <div v-if="!transactionsLoaded" class="loading-row">Loading...</div>

    <TmDataMsg v-else-if="!transactions.length">
      <div slot="title">No transactions</div>
      <div slot="subtitle">
        {{ oldChainDataMessage }}
      </div>
    </TmDataMsg>

    <template v-else>
      <EventList
        :events="transactions"
        :more-available="moreTransactionsAvailable"
        @loadMore="loadTransactions"
      />

      <template v-if="transactionsLoaded">
        <p class="message">
          {{ oldChainDataMessage }}
        </p>
      </template>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `page-transactions`,
  data: () => ({
    pageNumber: 0,
  }),
  computed: {
    ...mapState('data', [
      `validators`,
      `transactions`,
      `transactionsLoaded`,
      `moreTransactionsAvailable`,
    ]),
    ...mapState(['session']),
    oldChainDataMessage() {
      return `If you expected to see transactions here that are missing, 
      it's possible the transactions may have occured on a previous version of this blockchain.`
    },
  },
  methods: {
    async loadTransactions() {
      if (this.moreTransactionsAvailable) {
        await this.$store.dispatch('data/getTransactions', {
          address: this.session.address,
          pageNumber: this.pageNumber++,
        })
      }
    },
  },
  middleware: 'addressRequired',
}
</script>
<style scoped>
.message {
  display: flex;
  align-items: center;
  flex-direction: column;
  background: var(--app-fg);
  border-radius: var(--border-radius);
  margin: 1rem;
  padding: 2rem;
  font-size: 12px;
  color: var(--txt);
}

.loading-row {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-fg);
  height: 10rem;
  border-radius: var(--border-radius);
  margin: 0.5rem 1rem 1rem 2rem;
  animation: fade 2s infinite;
}
</style>
