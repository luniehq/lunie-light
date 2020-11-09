<template>
  <div>
    <div class="overview-header">
      <div class="overview-top">
        <h1>Governance Overview</h1>
        <div>
          <Button
            id="propose-btn"
            value="Create Proposal"
            type="secondary"
            @click.native="onPropose"
          />
        </div>
      </div>

      <!-- <div class="data-row">
        <div>
          <h4>Community Pool</h4>
          <p>
            {{ governanceOverview.treasurySize | prettyInt }} {{ stakingDenom }}
          </p>
        </div>
        <div>
          <h4>Total Staked</h4>
          <p>
            {{ governanceOverview.totalStakedAssets | prettyInt }}
            {{ stakingDenom }}
          </p>
        </div>
        <div v-if="governanceOverview.totalVoters">
          <h4>Total Voters</h4>
          <p>{{ governanceOverview.totalVoters | prettyInt }}</p>
        </div>
      </div> -->
    </div>

    <!-- v-ifing ModalPropose until we enable the "propose" action in Substrate -->
    <!-- <ModalPropose
      v-if="parameters && Object.keys(parameters).length > 0"
      ref="modalPropose"
      :denom="parameters.depositDenom || currentNetwork.stakingDenom"
      @success="() => afterPropose()"
    /> -->

    <!-- <template v-else> -->
    <template>
      <h4>Proposals</h4>
      <LiProposal
        v-for="proposal in proposals"
        :key="proposal.id"
        :proposal="proposal"
      />
    </template>

    <!-- <ParticipantList
      v-if="
        governanceOverview.topVoters && governanceOverview.topVoters.length > 0
      "
      :title="`Top Voters`"
      :participants="governanceOverview.topVoters"
    />

    <ProposalDescription
      v-if="governanceOverview.links && governanceOverview.links.length > 0"
      :supporting-links="governanceOverview.links"
    /> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { prettyInt } from '~/common/numbers'
// import network from '~/common/network'

export default {
  name: `page-proposals`,
  filters: {
    prettyInt,
  },
  props: {
    proposals: {
      type: Array,
      required: true,
    },
    governanceOverview: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    parameters: {
      depositDenom: '',
    },
  }),
  computed: {
    ...mapState([`connection`]),
  },
  methods: {
    onPropose() {
      this.$refs.modalPropose.open()
    },
    async afterPropose() {
      // first grab the validators
      await this.$store.dispatch('data/getValidators')
      await this.$store.dispatch('data/getProposals')
    },
  },
}
</script>

<style scoped>
.proposals {
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
