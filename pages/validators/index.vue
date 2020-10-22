<template>
  <TmPage
    :loading="!validators"
    :loader-path="`/img/validator-list-loading.svg`"
  >
    <template>
      <div class="filterContainer">
        <TmField
          v-model="searchTerm"
          class="searchField"
          placeholder="Search"
        />
        <div class="filterOptions">
          <div class="toggles">
            <TmBtn
              value="All"
              class="btn-radio"
              :type="allValidators ? `active` : `secondary`"
              @click.native="defaultSelectorsController(`allValidators`)"
            />
            <TmBtn
              value="Active"
              class="btn-radio"
              :type="activeOnly ? `active` : `secondary`"
              @click.native="defaultSelectorsController(`activeOnly`)"
            />
          </div>
          <div class="show-mobile-sorting">
            <i
              :class="{ active: showMobileSorting }"
              class="filter-toggle material-icons notranslate"
              @click="toggleMobileSorting"
              >filter_list</i
            >
          </div>
        </div>
      </div>

      <TableValidators
        :validators="filteredValidators"
        :delegations="delegations"
        :show-mobile-sorting="showMobileSorting"
        show-on-mobile="expectedReturns"
      />
      <div
        v-if="validators && validators.length === 0 && searchTerm"
        class="no-results"
      >
        No results for these search terms
      </div>
    </template>
  </TmPage>
</template>

<script>
import { mapState } from 'vuex'
import CosmosV2Source from '../../common/cosmosV2-source'
import network from '../../network'

export default {
  name: `page-validators`,
  data: () => ({
    searchTerm: '',
    activeOnly: true,
    allValidators: false,
    popularSort: true,
    validators: [],
    loaded: false,
    showMobileSorting: false,
  }),
  computed: {
    ...mapState([`address`]),
    filteredValidators() {
      if (this.searchTerm) {
        return this.sortedValidators.filter(({ name, operatorAddress }) => {
          return (
            name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            operatorAddress
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          )
        })
      } else {
        return this.sortedValidators
      }
    },
    sortedValidators() {
      if (this.allValidators) {
        return this.validators
      } else {
        return this.validators.filter(({ status }) => status === 'ACTIVE')
      }
    },
  },

  async asyncData({ $axios, store }) {
    const address = store.state.address
    const _store = {}
    const api = new CosmosV2Source($axios, network, _store, null, null)
    const [validators, delegations] = await Promise.all([
      api.getAllValidators(),
      address
        ? api.getDelegationsForDelegatorAddress(address)
        : Promise.resolve([]),
    ])
    return { validators, delegations }
  },
  methods: {
    defaultSelectorsController(selector) {
      this.allValidators = false
      this.activeOnly = false

      if (selector === `allValidators`) {
        this.allValidators = true
      }
      if (selector === `activeOnly`) {
        this.activeOnly = true
      }
    },
    toggleMobileSorting() {
      this.showMobileSorting = !this.showMobileSorting
    },
  },
}
</script>

<style scoped>
.filterContainer {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  margin: 0.5em 2em 1em;
}

.filterContainer .toggles {
  margin-bottom: 0;
  display: inline-flex;
}

.filterContainer input {
  max-width: 300px;
}

.filterContainer .btn-radio {
  min-width: 100px;
  border-radius: 0;
}

.filterContainer .btn-radio:last-child {
  border-radius: 0 0.5em 0.5em 0;
  margin-left: -1px;
}

.filterContainer .btn-radio:first-child {
  border-radius: 0.5em 0 0 0.5em;
  margin-right: -1px;
}

.show-mobile-sorting {
  display: none;
  cursor: pointer;
}

.show-mobile-sorting.active {
  color: var(--highlight);
}

.filterOptions {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-flow: row wrap;
  flex-flow: row wrap;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
}

.filter-toggle {
  margin-left: 1em;
}

.no-results {
  text-align: center;
  margin: 3em;
  color: var(--dim);
}

@media screen and (max-width: 768px) {
  .filterContainer {
    margin: 0.5rem 2rem 0 2rem;
  }

  .filterContainer .btn-radio {
    min-width: 75px;
  }

  .filterContainer input {
    max-width: 100%;
  }

  .filterOptions {
    padding: 1.5em 0.5em 0.5em;
    width: 100%;
  }

  .show-mobile-sorting {
    display: block;
  }
}

@media screen and (max-width: 360px) {
  .filterContainer {
    margin: 0.5em 1em 0.5em;
  }
}
</style>
