<template>
  <div class="container">
    <div v-if="!loaded">
      <Loader />
    </div>
    <table v-else-if="length" class="table">
      <thead>
        <TableHeader
          :sort="sort"
          :properties="columns"
          :show-row-count="showRowCount"
        />
      </thead>
      <tbody>
        <slot></slot>
      </tbody>
    </table>
    <template v-else-if="!length">
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
}
</script>

<style scoped>
.container {
  overflow: auto;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

table {
  table-layout: auto;
  border-collapse: collapse;
  min-width: 100%;
}

.no-results {
  padding: 2rem;
  height: 4rem;
  display: table-cell;
}

.no-results h2 {
  font-weight: 500;
  font-size: var(--text-lg);
}

thead {
  border-bottom: 1px solid var(--bc-dim);
}
</style>
