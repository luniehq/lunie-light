<template>
  <div>
    <div class="session-container">
      <h2 class="session-title">Use Lunie Browser Extension</h2>

      <div v-if="!filteredAccounts.length && !initialized" class="session-main">
        <Button
          value="Connect Lunie Extension"
          :loading="loading"
          @click.native="connect"
        />
      </div>

      <div v-if="error" class="error-container">
        <p>There was an error connecting to the Lunie extension:<br /></p>
        <p class="error">{{ error }}</p>
      </div>

      <div v-else-if="!loading && !initialized" class="session-main">
        <p>
          Looks like you don't have the Lunie browser extension installed yet.
        </p>
      </div>

      <div v-else-if="filteredAccounts.length" class="session-main accounts">
        <p class="extension-message">
          Below is a list of accounts we've received from the Lunie browser
          extension.
        </p>
        <AccountList
          :accounts="filteredAccounts"
          :button-action="signInAndRedirect"
          :button-text="`Use Account`"
        />
      </div>

      <div v-if="!filteredAccounts.length && initialized" class="session-main">
        <p class="extension-message">
          Looks like you don't have any addresses in the Lunie extension yet.
          Click on the extension icon in your browser and add an address now.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/common/network'

export default {
  name: `SessionLunieExtension`,
  layout: 'session',
  computed: {
    ...mapState('extension', [`accounts`, `initialized`, `error`, `loading`]),
    filteredAccounts() {
      return this.accounts.filter((account) => account.network === network.id)
    },
  },
  watch: {
    accounts: {
      immediate: false,
      handler(accounts) {
        if (accounts && accounts.length === 1) {
          this.signInAndRedirect(accounts[0])
        }
      },
    },
  },
  mounted() {
    this.$store.dispatch('extension/init')
  },
  methods: {
    connect() {
      this.$store.dispatch('extension/init')
    },
    signIn(account) {
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
        address: account.address,
      })
    },
    async signInAndRedirect(account) {
      await this.signIn(account)
      this.$router.push('/')
    },
  },
}
</script>
<style scoped>
.session-main {
  display: flex;
  justify-content: center;
}

.accounts {
  flex-direction: column;
}

.extension-message {
  text-align: center;
}
</style>
