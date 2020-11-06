<template>
  <div>
    <div class="filterContainer">
      <TmField v-model="searchTerm" class="searchField" placeholder="Search" />
      <div class="filterOptions">
        <div class="toggles">
          <Button
            value="All"
            class="btn-radio"
            :type="allValidators ? `active` : `secondary`"
            @click.native="defaultSelectorsController(`allValidators`)"
          />
          <Button
            value="Active"
            class="btn-radio"
            :type="activeOnly ? `active` : `secondary`"
            @click.native="defaultSelectorsController(`activeOnly`)"
          />
        </div>
      </div>
    </div>

    <TableValidators
      class="table-validators"
      :validators="filteredValidators"
      :delegations="delegations"
      :rewards="rewards"
      :search-term="searchTerm ? true : false"
      show-on-mobile="expectedReturns"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `page-validators`,
  data: () => ({
    searchTerm: '',
    activeOnly: true,
    allValidators: false,
  }),
  computed: {
    ...mapState('data', ['validators', 'delegations', 'rewards']),
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
  },
}
</script>

<style scoped>
.table-validators {
  margin: 1.5rem;
}

.filterContainer {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  margin: 1.5rem;
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
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  margin-left: -1px;
}

.filterContainer .btn-radio:first-child {
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  margin-right: -1px;
}

.filterOptions {
  padding-left: 0.5rem;
}

.filter-toggle {
  margin-left: 1em;
}

@media screen and (max-width: 768px) {
  .filterContainer {
    margin: 0 0.75rem 1rem;
  }

  .filterContainer .btn-radio {
    min-width: 64px;
  }
}

@media screen and (max-width: 360px) {
  .filterContainer {
    margin: 0.5em 1em 0.5em;
  }
}
</style>
