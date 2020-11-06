<template>
  <div class="user-menu">
    <UserMenuAddress :address="session ? session.address : undefined" />
    <i class="material-icons icon-button" @click="$router.push('/address')">
      person
    </i>
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
  padding: 1rem;
  width: 100%;
}

.icon-button {
  border-radius: 50%;
  border: none;
  outline: none;
  height: 2rem;
  width: 2rem;
  display: flex;
  margin-left: 0.25rem;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  cursor: pointer;
}

.icon-button i {
  font-size: 18px;
  color: var(--link);
  font-weight: 900;
}

@media screen and (max-width: 667px) {
  .user-menu {
    justify-content: center;
  }
}
</style>
