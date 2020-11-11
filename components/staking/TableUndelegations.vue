<template>
  <TableContainer
    :show-table="undelegations.length"
    :columns="properties"
    :sort="sort"
  >
    <ValidatorRow
      v-for="(undelegation, index) in undelegations"
      :key="undelegation.validatorAddress + undelegation.startHeight"
      :index="index"
      :validator="undelegation.validator"
      :undelegation="undelegation"
    />
  </TableContainer>
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
    sort: {
      property: `endTime`,
      order: `desc`,
    },
  }),
  computed: {
    properties() {
      return [
        {
          title: `Status`,
          value: `status`,
        },
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
}
</script>
