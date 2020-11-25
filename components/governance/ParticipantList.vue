<template>
  <div>
    <ul class="participant-list">
      <li
        v-for="(participant, index) in showingParticipants"
        :key="index"
        class="participant"
        :class="{ isValidator: participant.name }"
        @click="
          participant.name
            ? $router.push(`/validators/${participant.address}`)
            : null
        "
      >
        <div class="first-column">
          <span class="icon">
            <Avatar :address="participant.address" />
          </span>
          <span v-if="participant.name" class="name">{{
            participant.name
          }}</span>
          <span v-else class="name">
            <Address :address="participant.address" />
          </span>
        </div>
        <template v-if="participant.votingPower">
          <div v-if="network.network_type === `cosmos`">
            {{ participant.votingPower | bigFigureOrPercent }}
          </div>
          <div v-else>
            {{ participant.votingPower | bigFigureOrPercent }}
          </div>
        </template>
        <div v-if="showAmounts && participant.option">
          <span class="option">{{ participant.option }}</span>
        </div>
        <div v-if="showAmounts && participant.amount">
          <span class="amount"
            >{{ participant.amount.amount | prettyInt }}
            {{ participant.amount.denom }}</span
          >
        </div>
      </li>
    </ul>
    <div v-if="moreAvailable" class="loadmore-button-container">
      <Button
        id="loadMoreBtn"
        value="Load More"
        type="secondary"
        @click.native="loadMore"
      />
    </div>
  </div>
</template>

<script>
import { formatAddress } from '~/common/address'
import { prettyInt, bigFigure, bigFigureOrPercent } from '~/common/numbers'
import network from '~/common/network'

export default {
  name: `ParticipantList`,
  filters: {
    formatAddress,
    bigFigure,
    bigFigureOrPercent,
    prettyInt,
  },
  props: {
    title: {
      type: String,
      default: `Participant List`,
    },
    participants: {
      type: Array,
      required: true,
    },
    showAmounts: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    showing: 5,
    network,
  }),
  computed: {
    showingParticipants() {
      // if we don't clone this logic triggers vuex to complain about mutations
      return JSON.parse(JSON.stringify(this.participants))
        .sort((a, b) => !!b.picture - !!a.picture)
        .slice(0, this.showing)
    },
    moreAvailable() {
      return this.showingParticipants.length < this.participants.length
    },
  },
  methods: {
    loadMore() {
      if (this.moreAvailable) {
        this.showing += 5
      }
    },
  },
}
</script>

<style scoped>
.participant-list {
  margin: 0 auto;
  width: 100%;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
  overflow: auto;
}

h4 {
  font-size: 12px;
  padding-bottom: 1rem;
  color: var(--dim);
}

.first-column {
  min-width: 16rem;
}

.participant {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
  padding: 1rem 1.5rem;
}

.participant.isValidator:hover {
  background: var(--gray-100);
  cursor: pointer;
}

.participant div {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-end;
}

.participant div:first-child {
  justify-content: flex-start;
}

.name,
.option,
.amount {
  color: var(--bright);
  margin-right: 0.5rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.icon,
.option {
  margin-right: 1rem;
}

.name::-webkit-scrollbar,
.option::-webkit-scrollbar,
.amount::-webkit-scrollbar {
  display: none;
}

.voter,
.time {
  color: var(--dim);
}

.icon {
  height: 2.25rem;
  width: 2.25rem;
}

.loadmore-button-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0 0;
}
</style>
