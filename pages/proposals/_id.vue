<template>
  <div>
    <div v-if="proposal" class="proposal">
      <ProposalHeader
        id="proposal-description"
        :proposal="proposal"
        :status="status"
        @open-vote-modal="onVote"
        @open-deposit-modal="onDeposit"
      />

      <ProposalStatusBar
        v-if="tallyHasValues"
        :status="status"
        :status-begin-time="proposal.statusBeginTime"
        :total-votes="proposal.tally.total"
        :proposal="proposal"
      />

      <ParticipantList
        v-if="participants"
        :participants="participants"
        :show-amounts="true"
      />

      <template v-if="proposal.detailedVotes.timeline.length">
        <Timeline :timeline="proposal.detailedVotes.timeline" />
      </template>

      <ProposalDescription :proposal="proposal" />

      <DepositModal
        v-if="status.value === governanceStatusEnum.DEPOSITING"
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :denom="parameters.depositDenom || network.stakingDenom"
        :deposits="proposal.detailedVotes.deposits"
        @success="() => afterDeposit()"
      />
      <VoteModal
        v-else
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="vote"
        @success="() => afterVote()"
      />
    </div>
    <div v-else class="loading-row">Loading...</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BigNumber from 'bignumber.js'
import { percent, prettyInt } from '~/common/numbers'
import { date, fromNow } from '~/common/time'
import {
  getProposalStatus,
  governanceStatusEnum,
} from '~/common/proposal-status'
import network from '~/common/network'

export default {
  name: `page-proposal`,
  filters: {
    prettyInt,
    percent,
    date,
    fromNow,
    lowerCase: (text) => (text ? text.toLowerCase() : ''),
  },
  data: () => ({
    vote: undefined,
    parameters: {
      depositDenom: '',
    },
    error: undefined,
    found: false,
    loaded: false,
    governanceStatusEnum,
    network,
  }),
  computed: {
    ...mapState('data', ['proposals']),
    proposal() {
      if (this.proposals && this.proposals.length > 0) {
        return this.proposals.find(({ id }) => id === this.proposalId)
      } else {
        return null
      }
    },
    proposalId() {
      return Number(this.$route.params.id)
    },
    status() {
      return this.proposal ? getProposalStatus(this.proposal) : null
    },
    noVotes() {
      return BigNumber(this.proposal.tally.total).eq(0)
    },
    tallyHasValues() {
      return Object.values(this.proposal.tally)
        .filter((value) => value !== `Tally`)
        .find((value) => value)
    },
    participants() {
      if (
        this.proposal.detailedVotes.votes &&
        this.proposal.detailedVotes.votes.length > 0
      ) {
        return this.proposal.detailedVotes.votes.map((vote) => ({
          ...vote.voter,
          amount: vote.amount,
          option: vote.option,
        }))
      } else if (
        this.proposal.detailedVotes.deposits &&
        this.proposal.detailedVotes.deposits.length > 0
      ) {
        // a bit hacky but working
        return this.proposal.detailedVotes.deposits.map((deposit) => ({
          ...deposit.depositer,
          amount: deposit.amount[0],
        }))
      }
      return undefined
    },
  },
  methods: {
    onVote() {
      this.$refs.modalVote.open()
    },
    afterVote() {
      this.$apollo.queries.vote.refetch()
    },
    onDeposit() {
      this.$refs.modalDeposit.open()
    },
    afterDeposit() {
      // TODO
      this.$store.dispatch('data/getProposalDeposits', this.proposal)
    },
  },
}
</script>
<style scoped>
.proposal {
  padding: 0 1rem;
}

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
</style>
