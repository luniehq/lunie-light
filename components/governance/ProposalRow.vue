<template>
  <div class="proposal" @click="$router.push(`/proposals/${proposal.id}`)">
    <div class="proposal-content">
      <div>
        <div class="status">
          <Status :label="status.value" />
        </div>
        <h3 class="title">
          {{ proposal.title }}
        </h3>
      </div>
      <span v-if="proposal.creationTime" class="time">{{
        proposal.creationTime | fromNow
      }}</span>
      <span v-else class="time">n/a</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { fromNow } from '~/common/time'
import { getProposalStatus } from '~/common/proposal-status'

export default {
  name: `ProposalRow`,
  filters: {
    fromNow,
  },
  props: {
    proposal: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState('data', [`proposals`]),
    status() {
      return getProposalStatus(this.proposal)
    },
  },
}
</script>

<style scoped>
.proposal {
  padding: 1.5rem;
  margin: 0 auto 1rem;
  display: block;
  width: 100%;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

h3 {
  font-size: 22px;
  color: var(--bright);
  font-weight: 500;
  max-width: 600px;
  padding-top: 1rem;
}

.proposal:hover {
  cursor: pointer;
}

.proposal:hover .title {
  color: var(--link);
}

.proposal-content {
  display: flex;
  justify-content: space-between;
}

.time {
  align-self: flex-end;
  color: var(--dim);
  font-size: 14px;
}

@media screen and (max-width: 1023px) {
  .proposal-content {
    flex-direction: column;
  }

  .time {
    align-self: auto;
    padding-top: 1rem;
  }
}
</style>
