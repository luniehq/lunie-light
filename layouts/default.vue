<template>
  <div id="app" class="lunie-light">
    <AppHeader />
    <Notifications />
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
    this.$store.dispatch('signIn', session)

    this.loadData()
  },
  methods: {
    async loadData() {
      // somehow on mounted the mapState is not yet called
      if (!this.$store.state.data.api) {
        await this.$store.dispatch('data/init')
      }
    },
  },
}
</script>
