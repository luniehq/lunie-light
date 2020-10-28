<template>
  <TmPage
    data-title="Transactions"
    :loading="loading"
    :empty="dataEmpty"
    :empty-title="`No Transaction History`"
    :empty-subtitle="`There are no transactions associated with this address yet.`"
    :sign-in-required="true"
  >
    <template slot="signInRequired">
      <template>
        <EventList
          :events="transactions"
          :more-available="moreTransactionsAvailable"
          @loadMore="loadTransactions"
        >
          <template slot-scope="event">
            <TransactionItem
              :key="event.key"
              :transaction="event"
              :validators="validatorsAddressMap"
              :address="session ? session.address : undefined"
            />
          </template>
        </EventList>

        <template v-if="!loading">
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
    loading: true,
  }),
  computed: {
    ...mapState('data', [
      `validators`,
      `transactions`,
      `transactionsLoaded`,
      `moreTransactionsAvailable`,
    ]),
    ...mapState(['session']),
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach((item) => {
        names[item.operatorAddress] = item
      })
      return names
    },
    dataEmpty() {
      return this.transactions.length === 0
    },
  },
  mounted() {
    if (!this.transactionsLoaded) {
      this.loadTransactions()
    } else {
      this.loading = false
    }
  },
  methods: {
    async loadTransactions() {
      if (this.moreTransactionsAvailable) {
        this.loading = true
        await this.$store.dispatch('data/getTransactions', {
          address: this.session.address,
          pageNumber: this.pageNumber++,
        })
        this.loading = false
      }
    },
  },
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
