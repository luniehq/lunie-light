<template>
  <menu class="app-menu">
    <div>
      <UserMenu />
      <nuxt-link
        class="app-menu-item"
        to="/"
        exact="exact"
        title="Portfolio"
        @click.native="handleClick()"
      >
        <h2 class="app-menu-title">Portfolio</h2>
        <i class="material-icons notranslate">chevron_right</i>
      </nuxt-link>
      <nuxt-link
        class="app-menu-item"
        to="/validators"
        exact="exact"
        title="Validators"
        @click.native="handleClick()"
      >
        <h2 class="app-menu-title">Validators</h2>
        <i class="material-icons notranslate">chevron_right</i>
      </nuxt-link>

      <nuxt-link
        class="app-menu-item"
        to="/proposals"
        exact="exact"
        title="Proposals"
        @click.native="handleClick()"
      >
        <h2 class="app-menu-title">Proposals</h2>
        <i class="material-icons notranslate">chevron_right</i>
      </nuxt-link>

      <nuxt-link
        class="app-menu-item"
        to="/transactions"
        exact="exact"
        title="Transactions"
        @click.native="handleClick()"
      >
        <h2 class="app-menu-title">Transactions</h2>
        <i class="material-icons notranslate">chevron_right</i>
      </nuxt-link>
    </div>
    <div>
      <ConnectedNetwork @close-menu="handleClick" />
    </div>
  </menu>
</template>

<script>
export default {
  name: `AppMenu`,
  methods: {
    handleClick() {
      this.$emit(`close`)
      window.scrollTo(0, 0)
    },
  },
}
</script>

<style scoped>
.app-menu {
  z-index: var(--z-appMenu);
  display: flex;
  flex-flow: column;
  position: relative;
  height: 100%;
  padding-top: 3rem;
}

.app-menu-item:hover {
  background: var(--app-nav-hover);
}

.app-menu .app-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  margin: 0.5rem 1rem;
  font-weight: 400;
  font-size: 14px;
  color: var(--gray-500);
  border-radius: var(--border-radius);
  transition: all 0.5s ease;
}

.app-menu .app-menu-item--link:hover {
  color: var(--link-hover);
}

.app-menu .app-menu-item.nuxt-link-active {
  background: var(--app-nav-hover);
  box-shadow: 0 0 1px 0 var(--gray-700);
  color: var(--gray-100);
}

@media screen and (max-width: 1023px) {
  .app-menu {
    background: var(--app-nav);
    height: 100vh;
    top: 0;
    width: 100%;
    justify-content: space-between;
  }

  .app-menu .app-menu-item {
    padding: 0.5rem;
  }

  .app-menu-title {
    font-size: var(--text-3xl);
    line-height: 1.125;
    font-weight: 600;
    letter-spacing: 0.004em;
    color: var(--white);
  }
}

@media screen and (min-width: 1023px) {
  .app-menu {
    width: var(--sidebar-width);
    justify-content: space-between;
  }
}
</style>
