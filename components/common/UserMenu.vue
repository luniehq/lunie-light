<template>
  <div class="container">
    <div v-if="session" class="user-menu">
      <div>
        <h4>Your Address</h4>
        <UserMenuAddress :address="session.address" />
      </div>
      <i class="material-icons icon-button" @click="$router.push('/welcome')">
        person
      </i>
    </div>
    <template v-else>
      <Button
        value="Get Started"
        class="menu-button"
        type="secondary"
        @click.native="$router.push('/welcome')"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `UserMenu`,
  computed: {
    ...mapState(['session']),
  },
}
</script>

<style scoped>
.container,
.user-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.container {
  margin: 1rem 1rem 3rem;
}

.user-menu {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  background: var(--app-nav-hover);
  box-shadow: 0 0 1px 0 var(--gray-700);
}

h4 {
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.container .button.secondary {
  color: var(--gray-300);
  width: 100%;
}

.icon-button {
  border-radius: 50%;
  height: 1.5rem;
  width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--link-hover);
  font-size: var(--text-base);
  border: 2px solid var(--gray-800);
}

.icon-button:hover {
  cursor: pointer;
  color: var(--blue-700);
}

.button.menu-button {
  box-shadow: 0 0 2px 0 rgba(210, 210, 210, 0.1);
}

.button.menu-button.secondary:hover:not(:disabled) {
  background: rgba(210, 210, 210, 0.1);
}
</style>
