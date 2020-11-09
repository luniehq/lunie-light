<template>
  <SessionFrame icon="account_box">
    <div class="card-sign-in">
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
        <!-- <LiSession
          id="use-ledger-nano"
          icon="vpn_key"
          title="Ledger Nano"
          route="/ledger"
        /> -->
        <LiSession
          icon="person_add"
          title="Use Keplr Extension"
          route="/extension"
        />
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
        <span class="footnote" @click="signOut">
          Continue without address
        </span>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import network from '~/common/network'

export default {
  name: `card-sign-in-required`,
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
<style scoped>
h2,
h3 {
  text-align: center;
}

.footnote {
  padding-left: 1.5rem;
  font-size: 12px;
  color: var(--link);
  cursor: pointer;
}

.card-sign-in {
  max-width: 600px;
  padding: 1rem 0;
  margin: 0 auto;
  width: 100%;
}

.session-list {
  width: 100%;
  padding: 2rem 0;
}

@media screen and (max-width: 667px) {
  h2,
  h3 {
    text-align: center;
    padding-left: 0;
  }
}
</style>
