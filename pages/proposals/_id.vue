<template>
  <div>
    <div v-if="!proposalsLoaded && !proposal">
      <Loader />
    </div>
    <div v-else class="proposal">
      <ProposalHeader
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
        @success="() => afterVoteOrDeposit()"
      />
      <VoteModal
        v-else
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="vote"
        @success="() => afterVoteOrDeposit()"
      />
    </div>
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
  name: `PageProposal`,
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
    ...mapState('data', ['proposals', 'proposalsLoaded']),
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
    afterVoteOrDeposit() {
      this.$store.dispatch('data/getProposals')
    },
    onDeposit() {
      this.$refs.modalDeposit.open()
    },
  },
}
</script>
<style scoped>
.proposal {
  margin: 2rem;
  padding: 1.5rem 2rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
  max-width: 1024px;
}

@media screen and (max-width: 667px) {
  .proposal {
    border-radius: 0;
    box-shadow: none;
    max-width: none;
    margin: 0;
  }
}

@media screen and (min-width: 1324px) {
  .proposal {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
