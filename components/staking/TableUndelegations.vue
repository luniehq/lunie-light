<template>
  <div class="container">
    <table class="table">
      <thead>
        <TableHeader :properties="properties" />
      </thead>
      <tbody infinite-scroll-distance="400" name="flip-list"></tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: `table-undelegations`,
  props: {
    undelegations: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    query: ``,
    sort: {
      property: `endTime`,
      order: `desc`,
    },
    showing: 15,
    rollingWindow: 10000, // param of slashing period
  }),
  computed: {
    properties() {
      return [
        {
          title: `Name`,
          value: `smallName`,
        },
        {
          title: `End Time`,
          value: `endTime`,
        },
      ]
    },
  },
  watch: {
    'sort.property'() {
      /* istanbul ignore next */
      this.showing = 15
    },
    'sort.order'() {
      /* istanbul ignore next */
      this.showing = 15
    },
  },
  methods: {
    loadMore() {
      this.showing += 10
    },
  },
}
</script>
<style scoped>
.data-table >>> th:first-child {
  color: var(--dim);
  font-size: var(--text-xs);
}
</style>
