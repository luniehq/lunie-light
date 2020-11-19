<template>
  <div>
    <div
      v-if="!proposalsLoaded || !governanceOverviewLoaded"
      class="loading-row"
    >
      Loading...
    </div>

    <template v-else>
      <div class="proposals">
        <div class="overview-header">
          <div class="overview-top">
            <h1>Governance Overview</h1>
          </div>

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
            <div v-if="governanceOverview.totalVoters">
              <h4>Total Voters</h4>
              <p>{{ governanceOverview.totalVoters | prettyInt }}</p>
            </div>
          </div>
        </div>

        <template>
          <h4>Proposals</h4>
          <LiProposal
            v-for="proposal in proposals"
            :key="proposal.id"
            :proposal="proposal"
          />

          <Card v-if="!proposals.length">
            <div slot="title">No proposals</div>
            <div slot="subtitle">
              Noone created a proposal on this blockchain yet
            </div>
          </Card>
        </template>

        <ParticipantList
          v-if="
            governanceOverview.topVoters &&
            governanceOverview.topVoters.length > 0
          "
          :title="`Top Voters`"
          :participants="governanceOverview.topVoters"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/common/network'

export default {
  name: `GovernanceOverview`,
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
.loading-row {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-fg);
  height: 10rem;
  border-radius: var(--border-radius);
  margin: 0.5rem 1rem 1rem 2rem;
  animation: fade 2s infinite;
}

.proposals {
  margin: 2rem;
  padding: 0 1rem;
}

h1 {
  font-size: 32px;
  max-width: 500px;
  color: var(--bright);
}

h4 {
  font-size: 12px;
  color: var(--dim);
  font-weight: 400;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.overview-header {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 0 4rem;
  width: 100%;
}

.overview-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.overview-top div {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.overview-top .button {
  margin-left: 1rem;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-row div {
  font-size: 22px;
  color: var(--txt);
  padding: 1rem;
  border: 2px solid var(--bc);
  border-radius: 0.25rem;
  width: 100%;
  margin: 0 0.5rem;
  white-space: nowrap;
}

.data-row div:first-child {
  margin-left: 0;
}

.data-row div:last-child {
  margin-right: 0;
}

@media screen and (max-width: 1023px) {
  .tutorial-btn {
    display: none;
  }

  #propose-btn {
    margin: 2rem 0 0;
  }

  .overview-top {
    justify-content: center;
    flex-direction: column;
    padding-top: 2rem;
  }

  .data-row {
    flex-direction: column;
  }

  .data-row div {
    margin: -2px 0 0;
    border-radius: 0;
  }
}
</style>
