<template>
  <menu class="app-menu">
    <div>
      <nuxt-link
        class="app-menu-item"
        to="/portfolio"
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
        title="Validators"
        @click.native="handleClick()"
      >
        <h2 class="app-menu-title">Validators</h2>
        <i class="material-icons notranslate">chevron_right</i>
      </nuxt-link>

      <!-- <nuxt-link
        class="app-menu-item "
        to="/proposals"
        title="Proposals"
        @click.native="handleClick()"
      >
        <h2 class="app-menu-title">Proposals</h2>
        <i class="material-icons notranslate">chevron_right</i>
      </nuxt-link> -->

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
    <ConnectedNetwork @close-menu="handleClick" />
  </menu>
</template>

<script>
export default {
  name: `app-menu`,
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

.app-menu-item {
  color: var(--menu-text);
}

.app-menu-item:hover {
  background: var(--app-nav-hover);
}

.app-menu .app-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem 1rem;
  font-weight: 400;
  font-size: 14px;
  color: var(--menu-text);
  border-radius: 0.25rem;
  transition: all 0.5s ease;
}

.app-menu .app-menu-item--link:hover {
  color: var(--menu-link-hover);
}

.app-menu .app-menu-item.nuxt-link-active {
  background: var(--app-nav-hover);
}

.app-menu .app-menu-item.nuxt-link-active i {
  color: var(--highlight);
}

.app-menu .app-menu-item.nuxt-link-active h2 {
  color: var(--menu-bright);
  font-weight: 500;
}

@media screen and (min-width: 1024px) {
  .hide-m {
    display: none !important;
  }
}

@media screen and (max-width: 1023px) {
  .hide-s {
    display: none !important;
  }
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
    font-size: var(--xxl);
    line-height: 1.125;
    font-weight: 600;
    letter-spacing: 0.004em;
    color: var(--menu-bright);
  }
}

@media screen and (min-width: 1023px) {
  .app-menu {
    width: var(--sidebar-width);
    justify-content: space-between;
  }
}
</style>
