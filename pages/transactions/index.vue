<template>
  <TmPage :sign-in-required="true">
    <template slot="signInRequired">
      <div v-if="!transactions.length" class="loading-bar">Loading...</div>
      <template v-else>
        <EventList
          :events="transactions"
          :more-available="moreTransactionsAvailable"
          @loadMore="loadTransactions"
        />

        <template v-if="transactions">
          <p class="message">
            *If this transaction list looks incomplete, it's possible the
            transactions may have occured on a previous version of this
            blockchain.
          </p>
        </template>
      </template>
    </template>
  </TmPage>
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
  font-size: 11px;
  color: var(--txt);
  text-align: center;
  padding: 2rem;
}
</style>
