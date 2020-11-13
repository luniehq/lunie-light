<template>
  <div>
    <div class="container" v-if="!transactionsLoaded">
      <Loader />
    </div>

    <Card v-else-if="!transactions.length">
      <div slot="title">No transactions</div>
      <div slot="subtitle">
        {{ oldChainDataMessage }}
      </div>
    </Card>

    <template v-else>
      <EventList
        :events="transactions"
        :more-available="moreTransactionsAvailable"
        @loadMore="loadTransactions"
      />

      <template v-if="transactionsLoaded && !moreTransactionsAvailable">
        <div class="container">
          <p>{{ oldChainDataMessage }}</p>
        </div>
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
      return `If you're missing transactions from this list 
      they may have occured before the last blockchain upgrade.`
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
.container {
  display: flex;
  align-items: center;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: 0 0 3px 0 var(--gray-400);
  margin: 1rem;
  font-size: 12px;
  color: var(--txt);
}

.container p {
  padding: 2rem;
}
</style>
