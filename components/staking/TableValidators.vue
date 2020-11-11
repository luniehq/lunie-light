<template>
  <DataTable
    :show-table="showingValidators.length"
    :columns="properties"
    :sort="sort"
  >
    <ValidatorRow
      v-for="(validator, index) in showingValidators"
      :key="validator.operatorAddress"
      :index="index"
      :validator="validator"
      :delegation="getDelegation(validator)"
      :rewards="getRewards(validator)"
      :staking-denom="stakingDenom"
    />
  </DataTable>
</template>

<script>
import { orderBy } from 'lodash'
import network from '~/common/network'

export default {
  name: `table-validators`,
  components: {},
  props: {
    validators: {
      type: Array,
      required: true,
    },
    delegations: {
      type: Array,
      default: () => [],
    },
    rewards: {
      type: Array,
      default: () => [],
    },
    searchTerm: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    sort: {
      property: `votingPower`,
      order: `desc`,
    },
    showing: 25,
    stakingDenom: network.stakingDenom,
  }),
  computed: {
    sortedEnrichedValidators() {
      const orderedValidators = orderBy(
        this.validators.map((validator) => ({
          ...validator,
          smallName: validator.name ? validator.name.toLowerCase() : '',
        })),
        [this.sort.property],
        [this.sort.order]
      )
      return orderedValidators
    },
    showingValidators() {
      return this.sortedEnrichedValidators.slice(0, this.showing)
    },
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
          title: `Rewards`,
          value: `expectedReturns`,
        },
        {
          title: `Voting Power`,
          value: `votingPower`,
        },
      ]
    },
  },
  methods: {
    loadMore() {
      this.showing += 10
    },
    getDelegation({ operatorAddress }) {
      return this.delegations.find(
        ({ validator }) => validator.operatorAddress === operatorAddress
      )
    },
    getRewards({ operatorAddress }) {
      if (this.rewards) {
        return (
          this.rewards
            /* istanbul ignore next */
            .filter(
              ({ validator }) => validator.operatorAddress === operatorAddress
            )
        )
      }
    },
    sortBy(property) {
      if (this.sort.property === property) {
        this.sort.property = ``
        this.sort.order = `desc`
      } else {
        this.sort.property = property
        this.sort.order = `desc`
      }
    },
    isSortedBy(property) {
      return this.sort.property === property
    },
  },
}
</script>
<style scoped>
.no-results {
  text-align: center;
  margin: 3rem;
  color: var(--dim);
}

.sortingOptions {
  margin: 0.5rem 1rem;
}

.sortingOptions li.active {
  color: var(--primary);
}

.sortingOptions li {
  padding: 1rem 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.sorting-check {
  justify-content: space-between;
}

.sorting-check.inactive {
  color: var(--app-bg);
}

.sortingOptions .material-icons {
  font-size: 22px;
  width: 2rem;
  vertical-align: text-bottom;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

@media screen and (min-width: 768px) {
  .sortingOptions {
    display: none;
  }
}
</style>
