<template>
  <div v-if="address" class="address">
    <Address class="menu-address" :address="address || ''" />
    <!-- <div
      v-if="!session.isMobile && session.sessionType === 'ledger'"
      class="show-on-ledger-container"
    >
      <a class="show-on-ledger" @click="showAddressOnLedger()"
        >Show on Ledger</a
      >
    </div> -->
    <!-- <FormMessage
      v-if="ledgerAddressError"
      :msg="ledgerAddressError"
      type="custom"
    /> -->
  </div>
</template>
<script>
// import { showAddressOnLedger } from 'scripts/ledger'
export default {
  name: `UserMenuAddress`,
  props: {
    address: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    ledgerAddressError: undefined,
    // showAddressOnLedgerFn: showAddressOnLedger,
  }),
  methods: {
    // async showAddressOnLedger() {
    //   if (this.messageTimeout) {
    //     clearTimeout(this.messageTimeout)
    //     this.messageTimeout = undefined
    //   }
    //   this.ledgerAddressError = undefined
    //   try {
    //     await this.showAddressOnLedgerFn(this.currentNetwork.id, this.$store)
    //   } catch (error) {
    //     this.ledgerAddressError = error.message
    //     this.messageTimeout = setTimeout(
    //       () => (this.ledgerAddressError = undefined),
    //       8000
    //     )
    //   }
    // },
  },
}
</script>
<style scoped>
.show-on-ledger-container {
  display: inline-block;
  padding: 6px 10px;
  font-size: 12px;
  min-width: 0;
  background-color: var(--app-fg);
  border-radius: var(--border-radius);
  font-weight: 400;
  width: fit-content;
}
</style>
