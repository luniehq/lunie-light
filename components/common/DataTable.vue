<template>
  <div class="container">
    <table class="table">
      <thead>
        <TableHeader :sort="sort" :properties="columns" />
      </thead>
      <tbody :infinite-scroll-distance="infiniteScrollDistance">
        <slot v-if="showTable"></slot>
        <div v-else-if="!searchTerm" class="loading-row">Loading...</div>
        <div v-else class="no-results">No results</div>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'data-table',
  props: {
    showTable: {
      type: Number,
      default: false,
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
      default: '400',
    },
    loading: {
      type: Boolean,
      default: false,
    },
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
</style>