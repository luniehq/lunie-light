<template>
  <div>
    <div class="session-container">
      <h2 class="session-title">Use Keplr Browser Extension</h2>

      <div v-if="error" class="error-container">
        <p>There was an error connecting to the Keplr extension:<br /></p>
        <p class="error">{{ error }}</p>
      </div>

      <div v-else-if="loading" class="session-main">
        <p>Connecting to Keplr extension...</p>
      </div>

      <div v-else-if="!initialized" class="session-main">
        <p>
          Looks like you don't have the Keplr browser extension installed yet.
          Head over to the
          <a
            href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
            target="_blank"
            rel="noopener norefferer"
            >Chrome Web Store</a
          >
          to install the extension.
        </p>
      </div>

      <div v-else-if="accounts.length" class="session-main">
        <p class="extension-message">
          Below is a list of accounts we've received from the Keplr browser
          extension.
        </p>
        <AccountList
          :accounts="accounts"
          :button-action="signInAndRedirect"
          :button-text="`Use Account`"
        />
      </div>

      <div v-else class="session-main">
        <p class="extension-message">
          Looks like you don't have any addresses in the Keplr extension yet.
          Click on the extension icon in your browser and add an address now.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: `session-extension`,
  layout: 'session',
  computed: {
    ...mapState('keplr', [`accounts`, `initialized`, `error`, `loading`]),
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
    this.$store.dispatch('keplr/init')
  },
  methods: {
    signIn(account) {
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
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
