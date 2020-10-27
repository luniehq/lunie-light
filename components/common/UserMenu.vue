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
h3 {
  font-size: 12px;
}

.user-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1em;
}

.user-popover {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #eee;
  border-radius: 0.25rem;
}

.user-menu-icon-container {
  background: var(--app-fg);
  margin: 0 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
}

.notifications i {
  transition: transform 0.2s ease;
  font-size: 18px;
  transform: rotate(-30deg);
}

.notifications:hover i {
  transform: rotate(0);
}

.material-icons {
  font-size: 18px;
  font-weight: 500;
}

.address-list {
  max-height: 18rem;
  overflow: scroll;
}

.address-list-item {
  padding: 0 0 1rem 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.menu-list-item {
  padding: 0.75rem;
  margin: 0.25rem 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-width: 200px;
  align-items: center;
  border-radius: 0.25rem;
  color: #324175;
}

.menu-list-item.address-list-item {
  padding: 0.25rem;
}

.email {
  padding: 0.75rem;
  margin: 0.25rem 0;
}

.menu-list-item:hover:not(.address-list-item) {
  cursor: pointer;
  background: #eee;
}

.menu-list-item:hover i {
  cursor: pointer;
}

.menu-list-item.outline {
  border: 1px solid #eee;
}

.menu-list-item.selected {
  background: #e6fae6;
}

.address-list .material-icons {
  font-weight: 700;
}

.address-list span {
  display: block;
}

.address {
  font-weight: 400;
  margin-top: 0.25em;
  color: hsl(0, 0%, 40%);
}

.address-type {
  margin-top: 0.25em;
  color: hsl(0, 0%, 40%);
}

/* with an address type the addres box is a bit bigger so the rest needs to be centered */
.with-address-type {
  margin-top: 4px;
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--app-fg);
  overflow: hidden;
  color: var(--link);
}

.avatar {
  width: 100%;
  position: relative;
  top: 2px;
  padding: 6px;
}

.testnet-icon-container {
  position: absolute;
  bottom: 0.25rem;
  left: 1.5rem;
  display: flex;
  justify-content: center;
  z-index: 1;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  background-color: #9b82ff;
}

.testnet-icon {
  max-width: 0.75rem;
  transform: scaleX(-1);
  filter: invert(1);
}

.v-popover {
  cursor: pointer;
}

.user-menu-button {
  padding: 6px 10px;
  font-size: 12px;
  min-width: 0;
  color: var(--text);
  border-color: var(--primary);
  background-color: transparent;
}

.user-menu-button:hover {
  color: var(--menu-text);
  border-color: var(--bc);
}
</style>
