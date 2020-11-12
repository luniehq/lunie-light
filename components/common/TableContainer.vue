<template>
  <div class="container">
    <table class="table">
      <thead>
        <TableHeader
          :sort="sort"
          :properties="columns"
          :show-row-count="showRowCount"
        />
      </thead>
      <tbody
        v-infinite-scroll="loadMore"
        :infinite-scroll-distance="infiniteScrollDistance"
      >
        <tr v-if="!loaded" class="loading-row">
          <img :src="require(`../../assets/images/loader.svg`)" />
        </tr>
        <template v-else-if="length">
          <slot></slot>
        </template>
      </tbody>
    </table>

    <template v-if="loaded && !length">
      <slot name="empty">
        <tr class="no-results">
          No Results
        </tr>
      </slot>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TableContainer',
  props: {
    length: {
      type: Number,
      default: () => 0,
    },
    columns: {
      type: Array,
      required: true,
    },
    search: {
      type: Boolean,
      default: false,
    },
    sort: {
      type: Object,
      default: () => {},
    },
    infiniteScrollDistance: {
      type: String,
      default: '380',
    },
    loaded: {
      type: Boolean,
      default: false,
    },
    showRowCount: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      searchTerm: false,
    }
  },
  methods: {
    loadMore() {
      if (this.loaded) {
        this.$emit('loadMore')
      }
    },
  },
}
</script>

<style scoped>
.container {
  /* overflow: auto; vue infinite scroll doesn't like this */
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

table {
  table-layout: auto;
  border-collapse: collapse;
  min-width: 100%;
}

.no-results,
.loading-row {
  padding: 2rem;
  height: 4rem;
  display: table-cell;
}

.no-results h2 {
  font-weight: 500;
  font-size: var(--text-lg);
}

.loading-row.left {
  justify-content: left;
}
</style>
