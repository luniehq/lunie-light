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
  name: `connected-network`,
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
  margin: 0.5rem;
  padding: 0.5rem 1.25rem;
  display: flex;
  align-items: center;
  font-size: var(--xs);
  color: var(--menu-text-dim);
  justify-content: space-between;
}

.status {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.connected {
  display: flex;
  align-items: center;
}

.connected .status {
  background: var(--success);
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
    box-shadow: 0 0 0 0 var(--success-faded);
  }
  70% {
    transform: scale(0.9);
    box-shadow: 0 0 0 5px var(--success-faded);
  }
  100% {
    box-shadow: 0 0 0 0 var(--success-faded);
  }
}
</style>
