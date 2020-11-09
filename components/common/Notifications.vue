<template>
  <div class="notification-container">
    <Bar
      v-for="notification in notifications.notifications"
      :key="notification.id"
      :bar-type="notification.type"
      @close="$store.commit('notifications/remove', notification.id)"
    >
      {{ notification.message }}
    </Bar>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['notifications']),
  },
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
}
</style>
