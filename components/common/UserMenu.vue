<template>
  <div class="user-menu">
    <UserMenuAddress :address="session ? session.address : undefined" />
    <TmBtn
      type="secondary"
      :value="session ? 'Change Address' : 'View Address'"
      @click.native="$router.push('/address')"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `user-menu`,
  computed: {
    ...mapState(['session']),
  },
}
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1em;
}
</style>
