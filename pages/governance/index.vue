<template>
  <div>
    <div v-if="!proposalsLoaded" class="loading-row">Loading...</div>

    <Card v-else-if="!proposals.length">
      <div slot="title">No proposals</div>
      <!-- TODO: add some actionable button / link -->
      <div slot="subtitle">Submit now your own proposal to this blockchain</div>
    </Card>

    <template v-else>
      <PageProposals
        class="page"
        :proposals="proposals"
        :governance-overview="{}"
      />

      <template v-if="proposalsLoaded">
        <p class="message">
          {{ oldChainDataMessage }}
        </p>
      </template>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `proposals-index`,
  data: () => ({
    proposalsLoaded: false,
  }),
  computed: {
    ...mapState('data', [`proposals`]),
    ...mapState(['session']),
    oldChainDataMessage() {
      return `If you expected to see proposals here that are missing, 
      it's possible the proposals may have occured on a previous version of this blockchain.`
    },
  },
  mounted() {
    this.loadProposals()
  },
  methods: {
    async loadProposals() {
      // first grab the validators
      await this.$store.dispatch('data/getValidators')
      await this.$store.dispatch('data/getProposals')
      this.proposalsLoaded = true
    },
  },
}
</script>
<style scoped>
.message {
  display: flex;
  align-items: center;
  flex-direction: column;
  background: var(--app-fg);
  border-radius: var(--border-radius);
  margin: 1rem;
  padding: 2rem;
  font-size: 12px;
  color: var(--txt);
}

.loading-row {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-fg);
  height: 10rem;
  border-radius: var(--border-radius);
  margin: 0.5rem 1rem 1rem 2rem;
  animation: fade 2s infinite;
}

.page {
  margin: 1rem;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
</style>
