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
    <div v-if="isWindows && !hasHIDEnabled && !error">
      Due to recent Ledger updates, using a Ledger on Windows now requires
      "Experimental Web Platform features" to be enabled.
      <div v-if="isChrome">
        <br />
        <br />
        <p>
          Please copy the link below into a new tab and set the "Experimental
          Web Platform features" flag to "Enabled":
        </p>
        <div
          v-clipboard:copy="hidFeatureLink"
          v-clipboard:success="() => onCopy()"
          class="copy-feature-link"
        >
          {{ hidFeatureLink }}
          <i
            class="material-icons notranslate copied"
            :class="{ active: copySuccess }"
          >
            check
          </i>
        </div>
        <br />
        <br />
      </div>
    </div>
    <div v-else-if="isLinux && !error">
      Since we switched to WebUSB Linux users may experience connection issues
      with their devices.
      <br />
      <br />
      Please visit the following site to learn more about how to fix them:
      <div
        v-clipboard:copy="linuxLedgerConnectionLink"
        v-clipboard:success="() => onCopy()"
        class="copy-feature-link"
      >
        {{ linuxLedgerConnectionLink }}
        <i
          class="material-icons notranslate copied"
          :class="{ active: copySuccess }"
        >
          check
        </i>
      </div>
      <br />
      <br />
    </div>
    <div v-if="!isWindows && !isLinux" class="session-main">
      <p>
        Please use Chrome or Brave. Ledger is not supported in this browser.
      </p>
    </div>
    <div v-if="error" class="error-container">
      <p>There was an error connecting to the Ledger Nano:<br /></p>
      <p class="error">
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
  data: () => ({
    copySuccess: false,
    navigator: window.navigator,
    hidFeatureLink: `chrome://flags/#enable-experimental-web-platform-features`,
    linuxLedgerConnectionLink: `https://support.ledger.com/hc/en-us/articles/360019301813-Fix-USB-issues`,
  }),
  computed: {
    ...mapState('ledger', [`accounts`, `error`, `loading`]),
    isWindows() {
      return this.navigator.platform.includes('Win')
    },
    isChrome() {
      const ua = navigator.userAgent.toLowerCase()
      return /chrome|crios/.test(ua) && !/edge|opr\//.test(ua)
    },
    isLinux() {
      return this.navigator.platform.includes('Lin')
    },
    hasHIDEnabled() {
      return !!this.navigator.hid
    },
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
  mounted() {
    this.$store.dispatch('ledger/init')
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
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
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
  margin-bottom: 1rem;
}

.copy-feature-link {
  display: initial;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 0.2rem;
  color: var(--link);
}

.copy-feature-link .material-icons {
  font-size: 12px;
}

.copy-feature-link .copied {
  padding-bottom: 2px;
  padding-right: 0;
  transition: opacity 500ms ease;
  color: var(--success);
  opacity: 0;
}

.copy-feature-link .copied.active {
  opacity: 1;
}
</style>
