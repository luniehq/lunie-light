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

        <TmDataMsg v-if="!loading" icon="calendar_today">
          <div slot="title">Looking for older transactions?</div>
          <div slot="subtitle">
            <p>
              Lunie cannot display transactions from previous chains in your
              activity page.
            </p>
            <p>
              If you would like to view information from previous chain upgrades
              please visit our
              <a
                href="https://intercom.help/lunie/en/articles/3787014-how-to-get-blockchain-data-from-previous-chain-upgrades"
                >Help Center.</a
              >
            </p>
          </div>
        </TmDataMsg>
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
