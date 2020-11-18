<template>
  <nav class="app-header">
    <div class="container" :class="{ open: isOpen }">
      <div class="header-item" :class="{ open: isOpen }">
        <nuxt-link to="/">
          <img
            class="network-icon"
            :src="require(`../../assets/images/${network.logo}`)"
            alt="network logo"
          />
          {{ network.name }}
        </nuxt-link>
        <div class="header-menu-section">
          <template v-if="!desktop">
            <div v-if="isOpen" class="close-menu" @click="close()">
              <i class="material-icons notranslate mobile-menu-action">close</i>
            </div>
            <div v-if="!isOpen" class="open-menu" @click="open()">
              <i class="material-icons notranslate mobile-menu-action"
                >more_vert</i
              >
            </div>
          </template>
        </div>
      </div>
      <AppMenu v-if="isOpen || desktop" @close="close" />
    </div>
  </nav>
</template>

<script>
import network from '~/common/network'

export default {
  name: `AppHeader`,
  data: () => ({
    isOpen: false,
    desktop: false,
    network,
  }),
  mounted() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  updated() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  methods: {
    close() {
      this.isOpen = false
    },
    open() {
      this.isOpen = true
    },
    watchWindowSize() {
      const w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )

      if (w >= 1024) {
        this.close()
        this.desktop = true
      } else {
        this.desktop = false
      }
    },
  },
}
</script>

<style scoped>
.app-header {
  z-index: var(--z-appHeader);
  position: relative;
  width: var(--sidebar-width);
  display: flex;
  flex-direction: row;
}

.container {
  display: flex;
  flex-direction: row;
}

.app-header .header-item.open {
  background: var(--app-nav);
}

.mobile-menu-action {
  font-size: 1.5rem !important;
}

.app-header > .container {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  padding-top: 1.4rem;
}

.network-icon {
  height: 2rem;
  width: 2rem;
}

@media screen and (max-width: 1023px) {
  .app-header > .container.open {
    height: 100%;
    overflow: auto;
  }

  .app-header > .container {
    position: fixed;
    top: 0;
  }
}

.header-item-logo {
  height: 2rem;
  width: 6.5rem;
}

.header-menu-section {
  display: flex;
  align-items: center;
}

.header-menu-section > * {
  padding: 0 0.5rem;
}

.mobile-menu-action,
.header-menu-section a {
  color: var(--white);
}

.app-header .header-item {
  padding: 1.5rem 1.75rem;
  font-size: 0;
}

.app-header .header-item a {
  display: inline-block;
}

@media screen and (max-width: 1023px) {
  .app-header {
    width: 100%;
    min-height: 0;
  }

  .container {
    background: var(--app-nav);
    position: fixed;
    width: 100%;
  }

  .app-header .header-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem 0.5rem 1.5rem;
    color: var(--link);
    cursor: pointer;
  }

  .header-item-logo {
    height: 1.75rem;
  }
}

@media screen and (min-width: 1024px) {
  .app-header > .container {
    position: fixed;
    height: 100%;
    overflow: auto;
    background: var(--app-nav);
  }
}
</style>
