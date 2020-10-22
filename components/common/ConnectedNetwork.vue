<template>
  <div class="sidebar-bottom">
    <div
      v-if="!block.chainId"
      id="tm-connected-network"
      class="tm-connected-network"
    >
      <div class="tm-connected-network__connection">
        <div id="tm-connected-network__icon" class="tm-connected-network__icon">
          <span
            v-tooltip.top="`Network is up and running`"
            class="tm-connected-network__status green"
          />
        </div>
        <div
          id="tm-connected-network__string"
          class="tm-connected-network__string"
        >
          <span v-tooltip.top="networkTooltip" class="chain-id">
            {{ block.chainId }}
          </span>
        </div>
      </div>
      <div
        id="tm-connected-network__block"
        class="tm-connected-network__string"
      >
        <nuxt-link
          v-if="block.height"
          v-tooltip.top="'Block Height'"
          :class="
            `block-number` && {
              noClickable: true,
            }
          "
          :to="
            false
              ? ``
              : {
                  name: `block`,
                  params: { height: block.height, networkId: networkSlug },
                }
          "
          @click.native="handleClick()"
        >
          #{{ block.height | prettyInt }}
        </nuxt-link>
        <template v-else> -- </template>
      </div>
    </div>
    <div
      v-else
      id="tm-disconnected-network"
      class="tm-connected-network tm-disconnected-network"
    >
      <img
        class="tm-connected-network-loader"
        src="../../assets/images/loader.svg"
        alt="a small spinning circle to display loading"
      />
      <div
        class="tm-connected-network__string tm-connected-network__string--connecting"
      >
        Connecting…
      </div>
    </div>
  </div>
</template>
<script>
import { prettyInt } from '../../common/numbers'
import network from '../../network'
import CosmosV2Source from '../../common/cosmosV2-source'

export default {
  name: `connected-network`,
  filters: {
    prettyInt,
  },
  async asyncData({ $axios }) {
    const store = {}
    const api = new CosmosV2Source($axios, network, store, null, null)
    const block = await api.getBlockV2()
    return { block }
  },
  data: () => ({
    block: {},
  }),
  computed: {
    networkTooltip() {
      return this.block
        ? `You're connected to ${this.block.chainId}.`
        : `You are not connected.`
    },
  },
  mounted() {
    setInterval(() => {
      this.loadBlock()
    }, 10000)
  },
  methods: {
    handleClick() {
      this.$emit(`close-menu`)
      window.scrollTo(0, 0)
    },
    async loadBlock() {
      const store = {}
      const api = new CosmosV2Source(this.$axios, network, store, null, null)
      const block = await api.getBlockV2()
      this.block = block
    },
  },
}
</script>

<style scoped>
.sidebar-bottom {
  margin: 0.5rem;
  padding: 0.5rem;
  background: var(--app-nav);
}

.noClickable {
  cursor: unset;
}

.noClickable:hover {
  color: var(--link);
}

.tm-connected-network {
  align-items: center;
  border-radius: 0.25rem;
  color: var(--menu-text);
  display: flex;
  font-size: var(--sm);
  justify-content: space-between;
  padding: 0.5rem 0 0;
}

.tm-connected-network .chain-id {
  font-weight: 500;
  padding-right: 1rem;
  color: var(--menu-text);
}

.tm-connected-network .exit {
  font-size: var(--sm);
}

.tm-connected-network__icon {
  align-items: center;
  color: var(--success-bc);
  display: flex;
  font-size: var(--m);
  justify-content: center;
  padding-right: 0.25rem;
}

.tm-connected-network__icon .fa-spin {
  color: var(--warning);
}

.tm-connected-network--mocked .tm-connected-network__icon {
  color: var(--warning);
}

.tm-connected-network__connection {
  display: flex;
}

.tm-disconnected-network {
  justify-content: start;
}

.tm-connected-network__string--connecting {
  color: var(--warning);
}

.tm-connected-network-loader {
  height: 1rem;
  margin-right: 0.5rem;
  width: 1rem;
}

.tm-connected-network__status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
}

.block-number {
  color: var(--menu-link);
}

.block-number:hover {
  color: var(--menu-link-hover);
}

@media screen and (max-width: 1023px) {
  .sidebar-bottom {
    max-width: 100%;
  }
}

@media screen and (max-height: 640px) {
  .sidebar-bottom {
    position: static;
  }
}
</style>
