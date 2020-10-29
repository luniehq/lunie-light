<template>
  <SessionFrame icon="account_box">
    <div class="card-sign-in">
      <h2>Welcome 👋</h2>
      <h3>How would you like to get started?</h3>

      <div class="session-list">
        <LiSession
          id="choose-address"
          icon="person"
          title="Use existing address"
          route="/signin"
        />
        <LiSession
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
          id="explore-with-address"
          icon="language"
          title="Explore with any address"
          route="/explore"
        />
        <LiSession
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
export default {
  name: `card-sign-in-required`,
  data: () => ({
    loaded: false,
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
h2 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
}

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
