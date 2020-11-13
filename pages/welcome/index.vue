<template>
  <div class="welcome">
    <h2 class="session-title">Welcome 👋</h2>

    <div class="session-list">
      <LiSession
        v-if="network.localSigning"
        id="choose-address"
        icon="person"
        title="Use existing address"
        route="/signin"
      />
      <LiSession
        v-if="network.localSigning"
        id="create-new-address"
        icon="person_add"
        title="Create a new address"
        route="/create"
      />
      <LiSession
        id="use-ledger-nano"
        icon="usb"
        title="Ledger Nano"
        route="/ledger"
      />
      <LiSession icon="web" title="Use Keplr Extension" route="/extension" />
      <LiSession
        id="explore-with-address"
        icon="language"
        title="Explore with any address"
        route="/explore"
      />
      <LiSession
        v-if="network.localSigning"
        id="recover-with-backup"
        icon="settings_backup_restore"
        title="Recover with backup code"
        route="/recover"
      />
    </div>
    <a class="footnote" @click="signOut">Continue without address</a>
  </div>
</template>

<script>
import network from '~/common/network'

export default {
  name: `Session`,
  layout: 'session',
  data: () => ({
    loaded: false,
    network,
  }),
  methods: {
    signOut() {
      this.$store.dispatch('signIn', undefined)
      this.$router.push('/validators')
    },
  },
}
</script>
