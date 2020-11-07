<template>
  <div class="container">
    <table class="data-table">
      <template v-if="showingValidators.length">
        <thead>
          <PanelSort
            :sort="sort"
            :properties="properties"
            :show-on-mobile="showOnMobile"
          />
        </thead>
        <tbody
          v-infinite-scroll="loadMore"
          infinite-scroll-distance="400"
          name="flip-list"
        >
          <LiValidator
            v-for="(validator, index) in showingValidators"
            :key="validator.operatorAddress"
            :index="index"
            :validator="validator"
            :delegation="getDelegation(validator)"
            :rewards="getRewards(validator)"
            :show-on-mobile="showOnMobile"
            :staking-denom="stakingDenom"
          />
        </tbody>
      </template>
      <div v-else-if="!searchTerm" class="loading-row">Loading...</div>
      <div v-else class="no-results">No results</div>
    </table>
  </div>
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
    showOnMobile: {
      type: String,
      default: () => 'returns',
    },
    searchTerm: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    sort: {
      property: ``,
      order: `desc`,
    },
    showing: 15,
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

@media screen and (max-width: 550px) {
  .data-table td {
    overflow: hidden;
  }

  .data-table__row__info {
    max-width: 22rem;
  }
}

.data-table >>> th:first-child {
  width: 5%;
  color: var(--dim);
  font-size: var(--text-xs);
}

.data-table >>> th:nth-child(2) {
  width: 10%;
  color: var(--dim);
  font-size: var(--text-xs);
}

.data-table >>> th:nth-child(3) {
  width: 50%;
}

.sortingOptions {
  margin: 0.5rem 1rem;
}

.sortingOptions li.active {
  color: var(--highlight);
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
