<template>
  <div class="container">
    <template v-if="block">
      <div class="connected">
        <span class="status" />
        <span>{{ block.chainId }}</span>
      </div>
      <span v-if="block.height">
        {{ block.height | prettyInt }}
      </span>
      <span v-else>--</span>
    </template>

    <template v-else>
      <div class="disconnected">
        <span class="status" />
        <span>Not connected to chain API</span>
      </div>
    </template>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { prettyInt } from '../../common/numbers'

export default {
  name: `ConnectedNetwork`,
  filters: {
    prettyInt,
  },
  computed: {
    ...mapState('data', ['block']),
  },
  mounted() {
    if (!this.block) this.loadBlock()
    setInterval(() => {
      this.loadBlock()
    }, 7500)
  },
  methods: {
    loadBlock() {
      this.$store.dispatch('data/getBlock')
    },
  },
}
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--gray-500);
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  margin: 1rem;
  border-radius: var(--border-radius);
  background: var(--app-nav-hover);
  box-shadow: 0 0 1px 0 var(--gray-700);
}

.status {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 0.6rem;
}

.connected {
  display: flex;
  align-items: center;
}

.connected .status {
  background: var(--green-500);
  animation: pulse 2.5s infinite;
}

.disconnected {
  display: flex;
  align-items: center;
}

.disconnected .status {
  background: var(--danger);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 hsla(120, 61%, 45%, 0.15);
  }
  70% {
    transform: scale(0.9);
    box-shadow: 0 0 0 5px hsla(120, 61%, 45%, 0.15);
  }
  100% {
    box-shadow: 0 0 0 0 hsla(120, 61%, 45%, 0.15);
  }
}
</style>
