<template>
  <div class="table-container">
    <h1>Your Stake</h1>
    <TableValidators
      :validators="delegations.map(({ validator }) => validator)"
      :delegations="delegations"
      :rewards="rewards"
      :loaded="delegationsLoaded"
      class="table-validators"
    >
      <template slot="empty">
        <div class="no-results">
          <h2>No validators in your portfolio.</h2>
          <p>
            Head over to the
            <a @click="goToValidators()">validator list</a>&nbsp;to start
            staking.
          </p>
        </div>
      </template>
    </TableValidators>
    <!-- <UnstakeModal ref="UnstakeModal" /> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `Delegations`,
  computed: {
    ...mapState('data', ['delegations', 'delegationsLoaded', 'rewards']),
  },
  methods: {
    goToValidators() {
      this.$router.push('/validators')
    },
    openUnstakeModal() {
      this.$refs.UnstakeModal.open()
    },
  },
}
</script>
<style scoped>
.table-container {
  margin: 0 auto;
  width: 100%;
  padding: 3rem 4rem;
}

.tm-form-msg--desc {
  padding-bottom: 1rem;
}

@media screen and (max-width: 1023px) {
  .table-container {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

@media screen and (max-width: 667px) {
  .table-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
