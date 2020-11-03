<template>
  <div id="app" class="lunie-light">
    <AppHeader />
    <div id="app-content">
      <UserMenu />
      <Nuxt />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: () => ({
    loading: true,
  }),
  computed: {
    ...mapState(['session']),
    ...mapState(['data', ['validators']]),
  },
  mounted() {
    const session = this.$cookies.get('lunie-session')
    this.$store.dispatch('signIn', session) // calls 'data/refresh' to load the users data
  },
  middleware({ store }) {
    if (!store.state.data.api) {
      store.dispatch('data/init') // init api
    }
  },
}
</script>
