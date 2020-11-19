<template>
  <div class="session-container">
    <h2 class="session-title">Use Ledger Hardware Wallet</h2>

    <div class="session-main">
      <Button
        value="Connect Ledger"
        :loading="loading"
        @click.native="connect"
      />
    </div>
    <div class="error-container">
      <p>There was an error connecting to the Ledger Nano:<br /></p>
      <p v-if="error" class="error">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: `SessionLedger`,
  layout: 'session',
  computed: {
    ...mapState('ledger', [`accounts`, `error`, `loading`]),
  },
  watch: {
    accounts: {
      immediate: false,
      handler(accounts) {
        if (accounts) {
          this.signInAndRedirect(accounts[0])
        }
      },
    },
  },
  methods: {
    connect() {
      this.$store.dispatch('ledger/init')
    },
    signIn(account) {
      this.$store.dispatch(`signIn`, {
        sessionType: `ledger`,
        address: account.address,
      })
    },
    async signInAndRedirect(account) {
      await this.signIn(account)
      this.$router.push('/portfolio')
    },
  },
}
</script>
<style scoped>
.session-main {
  display: flex;
  justify-content: center;
}
</style>
