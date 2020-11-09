<template>
  <table class="table">
    <thead>
      <PanelSort :sort="sort" :properties="columns" />
    </thead>
    <tbody :infinite-scroll-distance="infiniteScrollDistance">
      <slot v-if="showTable"></slot>
      <div v-else-if="!searchTerm" class="loading-row">Loading...</div>
      <div v-else class="no-results">No results</div>
    </tbody>
  </table>
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
      default: {},
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
.table {
  border-spacing: 0 0.25rem;
  width: 100%;
  min-width: 400px;
  overflow-x: scroll;
  padding: 0;
  table-layout: auto;
  box-shadow: 0 0 1px 0 var(--gray-500);
  border-radius: var(--border-radius);
  background: var(--white);
}

.table th,
.table td {
  padding: 0.5rem 1.5rem;
}

.table th {
  text-align: left;
}

.table td {
  position: relative;
  vertical-align: middle;
  width: 100%;
}

.table tr td:first-child::before {
  position: absolute;
  font-size: var(--text-xs);
  text-align: right;
  color: var(--dim);
  left: -1.5rem;
}

.table th:first-child {
  color: var(--dim);
  font-size: var(--text-xs);
}

.table th:nth-child(2) {
  color: var(--dim);
  font-size: var(--text-xs);
}

.table__row__cell__separator::after {
  display: block;
  position: absolute;
  content: '';
  height: 2.5rem;
  width: 2px;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--bc-dim);
}

.table__row {
  padding: 1rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--bc-dim);
  cursor: pointer;
}

.table__row__info {
  display: flex;
  align-items: center;
}

.table__row__info__container__status {
  left: 0;
  top: 9px;
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  position: absolute;
  width: 0.5rem;
}

.table__row__info__container__status.red {
  background: var(--danger);
}

.table__row__info__container__status.yellow {
  background: var(--warning);
}

.table__row__info__container__status.green {
  background: var(--success);
}

.table__row__info__container {
  position: relative;
}

.table__row__info__container__name {
  padding-left: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.table__row__info__image {
  height: 3rem;
  width: 3rem;
  margin-right: 0.5rem;
  display: block;
  background: var(--app-nav-light);
}

.table__row__info__image--no-img {
  padding: 0.5rem;
}

.table__row__info__container__description {
  font-size: var(--text-xs);
  padding-left: 1rem;
}
</style>