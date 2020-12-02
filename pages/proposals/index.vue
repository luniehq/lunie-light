<template>
  <div class="proposals">
    <div v-if="!proposalsLoaded || !governanceOverviewLoaded">
      <Loader />
    </div>
    <template v-else>
      <h3>Proposals</h3>
      <ProposalRow
        v-for="proposal in proposals"
        :key="proposal.id"
        :proposal="proposal"
      />

      <Card v-if="!proposals.length">
        <div slot="title">No proposals</div>
        <div slot="subtitle">
          There are no proposals on this blockchain yet.
        </div>
      </Card>

      <h3>Stats</h3>
      <div class="data-row">
        <div>
          <h4>Community Pool</h4>
          <p>
            {{ governanceOverview.treasurySize }}
            {{ network.stakingDenom }}
          </p>
        </div>
        <div>
          <h4>Total Staked</h4>
          <p>
            {{ governanceOverview.totalStakedAssets }}
            {{ network.stakingDenom }}
          </p>
        </div>
      </div>

      <h3>Voting Power</h3>
      <ParticipantList
        v-if="
          governanceOverview.topVoters &&
          governanceOverview.topVoters.length > 0
        "
        :participants="governanceOverview.topVoters"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/common/network'

export default {
  name: `Proposals`,
  data: () => ({
    network,
  }),
  computed: {
    ...mapState('data', [
      `proposals`,
      `governanceOverview`,
      `proposalsLoaded`,
      `governanceOverviewLoaded`,
    ]),
  },
}
</script>
<style scoped>
.proposals {
  padding: 0 4rem 3rem;
}

h3 {
  font-size: 24px;
  color: var(--gray-800);
  font-weight: 600;
  padding: 3rem 0 1.5rem;
}

h4 {
  font-size: var(--text-sm);
  color: var(--dim);
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-row div {
  font-size: 22px;
  color: var(--txt);
  padding: 1rem 1.5rem;
  width: 100%;
  white-space: nowrap;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

.data-row div:first-child {
  margin-right: 1rem;
}

@media screen and (max-width: 1023px) {
  .proposals {
    padding: 1rem;
  }

  .data-row {
    flex-direction: column;
  }

  .data-row div:first-child {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>
