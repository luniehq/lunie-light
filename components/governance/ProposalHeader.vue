<template>
  <header class="header">
    <div class="header-top-column">
      <div class="header-top-row">
        <div>
          <BackButton />
        </div>

        <div class="inner-status">
          <Status :label="status.value" />
        </div>

        <div class="buttons">
          <CopyButton :value="currentRoute" />
          <Button
            v-if="status.value === governanceStatusEnum.DEPOSITING"
            id="deposit-btn"
            class="action-button"
            value="Deposit"
            color="primary"
            @click.native="$emit(`open-deposit-modal`)"
          />
          <Button
            v-if="status.value === this.governanceStatusEnum.VOTING"
            id="vote-btn"
            class="action-button"
            value="Vote"
            color="primary"
            @click.native="$emit(`open-vote-modal`)"
          />
        </div>
      </div>

      <div class="outer-status">
        <Status :label="status.value" />
      </div>
    </div>

    <div class="content-container">
      <h2>{{ proposal.title }}</h2>

      <div class="proposer-and-summary-container">
        <div v-if="proposal.proposer" class="proposer">
          <span>Proposed By:</span>
          <div v-if="proposal.proposer.validator" class="proposer-details">
            <div>
              <Avatar
                class="proposer-image"
                :address="proposal.proposer.address"
              />
            </div>
            <nuxt-link :to="`/validators/${proposal.proposer.address}`">{{
              proposal.proposer.name
            }}</nuxt-link>
          </div>
          <Address v-else :address="proposal.proposer.address" />
        </div>
        <p class="summary">{{ proposal.summary }}</p>
      </div>
    </div>

    <nav>
      <ul class="page-links">
        <li>
          <a v-scroll-to="'#proposal-description'" href="#">Description</a>
        </li>
        <li><a v-scroll-to="'#proposal-votes'" href="#">Votes</a></li>
        <li><a v-scroll-to="'#proposal-timeline'" href="#">Timeline</a></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import { governanceStatusEnum } from '~/common/proposal-status'
import { formatAddress } from '~/common/address'

export default {
  name: `ProposalHeader`,
  filters: {
    formatAddress,
  },
  props: {
    proposal: {
      type: Object,
      required: true,
    },
    status: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    governanceStatusEnum,
  }),
  computed: {
    ...mapGetters([`currentNetwork`]),
    currentRoute() {
      return location.href
    },
  },
}
</script>

<style scoped>
.header {
  padding: 2rem 0 0;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.header-top-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 4rem;
}

.header-top-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-top-row > div:first-child,
.header-top-row > div:last-child {
  width: 33%;
  display: flex;
}

.header-top-row > div:last-child {
  justify-content: flex-end;
}

h2 {
  font-size: 32px;
  margin-bottom: 2rem;
  max-width: 500px;
  font-weight: 500;
  color: var(--bright);
  padding-right: 2rem;
}

.page-links {
  display: flex;
}

.page-links li {
  display: inline-block;
  padding: 2rem 2rem 2rem 0;
}

.action-button {
  margin-left: 0.5rem;
}

.buttons {
  display: flex;
  align-items: center;
}

.content-container {
  display: flex;
  justify-content: space-between;
}

.proposer {
  font-size: 12px;
  padding: 1rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
  display: flex;
  flex-direction: column;
}

.summary {
  font-size: 12px;
  padding: 2rem 0 0 2px;
  font-style: italic;
}

.icon-container {
  margin: 0 0.5rem 0 0;
}

.icon-container .success {
  opacity: 0;
  transition: opacity 250ms ease;
}

.icon-container.active .success {
  opacity: 1;
}

.outer-status {
  display: none;
}

.proposer-and-summary-container {
  max-width: 300px;
}

.proposer-details {
  display: flex;
  align-items: center;
}

.proposer-details .proposer-image {
  margin: 1rem 1rem 0 0;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
}

.proposer-details a {
  margin-top: 0.7rem;
}

@media screen and (max-width: 667px) {
  .inner-status {
    display: none;
  }

  .outer-status {
    display: initial;
  }

  .header-top-row {
    padding: 0 0 2rem;
  }

  .header-top-column {
    padding: 0 0 4rem;
  }
}

@media screen and (max-width: 1023px) {
  h2 {
    padding-right: 0;
  }

  .content-container {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .page-links {
    justify-content: center;
  }

  .page-links li {
    padding: 2rem 2rem;
  }

  .proposer {
    flex-direction: row;
  }

  .proposer-details {
    padding-left: 1rem;
  }
}
</style>
