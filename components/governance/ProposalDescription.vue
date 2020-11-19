<template>
  <div id="proposal-description" class="proposal-description">
    <div class="description-content-container">
      <section v-if="proposal && proposal.description">
        <h4>Description</h4>
        <div class="description">
          <pre
            v-if="
              proposal.type === `PARAMETER_CHANGE` ||
              proposal.type === `TREASURY`
            "
            >{{ proposal.description }}</pre
          >
          <p v-else>{{ proposal.description }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: `ProposalDescription`,
  props: {
    proposal: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

<style scoped>
h4 {
  font-size: 12px;
  padding-bottom: 1rem;
  color: var(--dim);
}

.proposal-description {
  padding: 2rem;
  background: var(--app-fg);
  width: 100%;
}

.description-content-container {
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
  display: flex;
}

.description {
  max-width: 640px;
  margin: 0 4rem 0 0;
  padding: 0 0 4rem 0;
  white-space: pre-wrap;
  color: var(--txt);
}

pre {
  font-family: 'Menlo', 'Consolas', monospace;
  border-radius: 0.25rem;
  background: var(--app-nav-hover);
  color: var(--gray-500);
  font-size: 14px;
  padding: 1rem;
  word-break: break-word;
}

@media screen and (max-width: 1023px) {
  .description-content-container {
    flex-direction: column;
  }

  .proposal-description {
    display: block;
    word-break: break-word;
    text-align: justify;
  }

  .description {
    margin: 0;
  }
}
</style>
