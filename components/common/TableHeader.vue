<template>
  <tr class="header-row">
    <th v-if="showRowCount" class="cell index"></th>
    <th v-for="property in properties" :key="property.value" class="cell">
      <a
        v-if="property.title"
        class="sort-link"
        :class="{
          asc: sortProperty === property.value && sortOrder === 'asc',
          desc: sortProperty === property.value && sortOrder === 'desc',
        }"
        @click="orderBy(property.value)"
      >
        {{ property.title }}
        <i class="material-icons notranslate">arrow_drop_up</i>
      </a>
    </th>
  </tr>
</template>

<script>
export default {
  name: `TableHeader`,
  props: {
    sort: {
      type: Object,
      default: null,
    },
    properties: {
      type: Array,
      required: true,
    },
    showRowCount: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    sortOrder: {
      get() {
        return this.sort.order
      },
      set(value) {
        this.sort.order = value
      },
    },
    sortProperty: {
      get() {
        return this.sort.property
      },
      set(value) {
        this.sort.property = value
      },
    },
  },
  methods: {
    orderBy(property) {
      if (this.sortProperty === property) {
        if (this.sortOrder === `asc`) {
          this.sortOrder = `desc`
        } else {
          this.sortOrder = `asc`
        }
      } else {
        this.sortProperty = property
      }
    },
  },
}
</script>

<style scoped>
th {
  padding: 0.5rem 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.sort-link {
  font-size: var(--text-xs);
  color: var(--dim);
}

.sort-link i {
  font-size: var(--text-xl);
  position: relative;
  top: 6px;
  right: 4px;
}

.sort-link a {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  color: var(--dim);
}

.sort-link a:hover {
  color: var(--link);
}

.sort-link.asc,
.sort-link.desc {
  color: var(--primary);
}

.sort-link.asc i {
  color: var(--primary);
}

.sort-link.desc i {
  transform: rotate(180deg);
  color: var(--primary);
}
</style>
