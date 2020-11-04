<template>
  <div class="page">
    <template v-if="initialLoad && loaderPath" class="loading-image-container">
      <img
        class="loading-image"
        :src="loaderPath"
        alt="geometric placeholder loading shapes"
      />
    </template>

    <TmDataMsg
      v-else-if="!initialLoad && empty"
      icon="error"
      icon-color="var(--dark-grey-blue)"
      :title="emptyTitle"
      :subtitle="emptySubtitle"
    />

    <template v-else-if="!initialLoad && !empty">
      <slot></slot>
    </template>
    <slot v-if="session" name="signInRequired"></slot>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: `page`,
  props: {
    loadingMore: {
      type: Boolean,
      default: false,
    },
    loaderPath: {
      type: String,
      default: ``,
    },
    empty: {
      type: Boolean,
      default: false,
    },
    emptyTitle: {
      type: String,
      default: `No data`,
    },
    emptySubtitle: {
      type: String,
      default: ``,
    },
  },
  computed: {
    ...mapState(['session']),
    ...mapState(['data', ['initialLoad']]), // initialLoad doesn't exist anymore. but we are deprecating TmPage
  },
}
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem 0 0;
}

.loading-image-container {
  padding: 2em;
}

.readable-width {
  max-width: 800px;
}

.page.dark-background {
  background: var(--app-fg);
}

.column {
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: normal;
  width: 100%;
}

.row {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 0 1rem;
}

.page-profile__section {
  margin-bottom: 1rem;
}

.page-profile__section-title {
  margin: 0 0 0.25rem 1rem;
  color: var(--dim);
  font-size: var(--sm);
  font-weight: 500;
}

li {
  width: 100%;
  padding: 1rem;
  border-bottom: 1px solid var(--bc-dim);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

li:last-child {
  border-bottom: none;
}

h4 {
  color: var(--txt);
  font-size: var(--sm);
  margin-bottom: 2px;
  font-weight: 500;
}

.row span {
  color: var(--bright);
  font-size: var(--sm);
  font-weight: 400;
  line-height: 1rem;
}

@media screen and (max-width: 1024px) {
  .page {
    margin: 0 auto 6rem;
  }
}

@media screen and (max-width: 667px) {
  .page {
    padding-bottom: 4rem;
  }
}
</style>
