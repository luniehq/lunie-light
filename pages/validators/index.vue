<template>
  <div>
    <div class="filterContainer">
      <Field v-model="searchTerm" class="searchField" placeholder="Search" />
      <div class="filterOptions">
        <div class="toggles">
          <Button
            value="All"
            class="toggle-button"
            :type="allValidators ? `active` : `secondary`"
            @click.native="defaultSelectorsController(`allValidators`)"
          />
          <Button
            value="Active"
            class="toggle-button"
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
      :loaded="validatorsLoaded"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `PageValidators`,
  data: () => ({
    searchTerm: '',
    activeOnly: true,
    allValidators: false,
  }),
  computed: {
    ...mapState('data', [
      'validators',
      'validatorsLoaded',
      'delegations',
      'delegationsLoaded',
      'rewards',
    ]),
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
  padding: 1.5rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

.searchField {
  max-width: 500px;
}

.toggles {
  margin-bottom: 0;
  display: inline-flex;
}

.filterContainer input {
  max-width: 300px;
}

.toggle-button {
  min-width: 100px;
  border-radius: 0;
  background: var(--white);
  color: var(--txt);
  border-color: var(--input-bc);
}

.toggle-button.active {
  background: var(--blue-200);
}

.toggle-button:last-child {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  margin-left: -1px;
}

.toggle-button:first-child {
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  margin-right: -1px;
}

.toggles .toggle-button:hover:not(:disabled) {
  background: var(--blue-100);
  border-color: var(--input-bc);
}

.filterOptions {
  padding-left: 0.5rem;
}

.filter-toggle {
  margin-left: 1em;
}
</style>
