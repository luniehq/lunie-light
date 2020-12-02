<template>
  <div>
    <div v-if="!validatorsLoaded">
      <Loader />
    </div>
    <Card
      v-else-if="validators.length && !validator"
      title="Validator Not Found"
      subtitle="Please try again."
    />

    <div v-else class="validator-container">
      <div class="status-container">
        <Status :label="validator.status" />
      </div>
      <div class="validator-header">
        <div class="identity">
          <Avatar
            class="image"
            alt="validator logo"
            :address="validator.operatorAddress"
          />
          <div class="validator-info">
            <h3 class="name">{{ validator.name }}</h3>
            <div v-if="delegation && delegation.amount">
              <h4>{{ delegation.amount | fullDecimals }}</h4>
              <h5 v-if="rewards && rewards.length > 0">
                +{{ filterStakingDenomReward() | noBlanks }}
              </h5>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <Button :value="`Stake`" @click.native="openStakeModal" />
          <Button
            :disabled="!delegation"
            :value="`Unstake`"
            type="secondary"
            @click.native="openUnstakeModal"
          />
        </div>
      </div>

      <section class="validator-data">
        <div>
          <h4>Description</h4>
          <span>{{ validator.details | noBlanks }}</span>
        </div>
        <div>
          <h4>Website</h4>
          <span v-if="validator.website">
            <a
              :href="validator.website + `?ref=lunie`"
              target="_blank"
              rel="nofollow noreferrer noopener"
              >{{ validator.website }}</a
            >
          </span>
          <span v-else>
            {{ validator.website | noBlanks }}
          </span>
        </div>
        <div>
          <h4>Validator Address</h4>
          <span>
            <Address :address="validator.operatorAddress" />
          </span>
        </div>
      </section>

      <section class="row">
        <div>
          <h4>Rewards</h4>
          <span>
            {{ validator.expectedReturns | percent }}
            <span class="note">(Approx. Annualized)</span>
          </span>
        </div>
        <div>
          <h4>Voting Power</h4>
          <span>
            {{ validator.votingPower | percent }}
          </span>
        </div>
      </section>
      <section class="row">
        <div>
          <h4>Total Stake</h4>
          <span>
            {{ validator.tokens | shortDecimals }}
            <span class="note">(Self Stake: {{ selfStake }})</span>
          </span>
        </div>
        <div>
          <h4>Number of Stakers</h4>
          <span>{{ validatorDelegations.length }}</span>
        </div>
      </section>
      <section class="row">
        <div>
          <h4>Uptime</h4>
          <span>{{ isBlankField(validator.uptimePercentage, percent) }}</span>
        </div>
        <div>
          <h4>Validator Since</h4>
          <span>Block #{{ validator.startHeight || 0 }}</span>
        </div>
      </section>
      <section class="row">
        <div>
          <h4>Current Commission Rate</h4>
          <span>{{ isBlankField(validator.commission, percent) }}</span>
        </div>
        <div>
          <h4>Max Commission Rate</h4>
          <span>{{ isBlankField(validator.maxCommission, percent) }}</span>
        </div>
      </section>
      <section class="row">
        <div>
          <h4>Max Daily Commission Change</h4>
          <span>{{
            isBlankField(validator.maxChangeCommission, percent)
          }}</span>
        </div>
        <div>
          <h4>Last Commission Change</h4>
          <span>{{
            isBlankField(validator.commissionUpdateTime, fromNow)
          }}</span>
        </div>
      </section>
    </div>
    <LazyStakeModal ref="StakeModal" :target-validator="validator" />
    <LazyUnstakeModal
      ref="UnstakeModal"
      :source-validator="validator"
      :is-unnomination="true"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { shortDecimals, fullDecimals, percent } from '~/common/numbers'
import { noBlanks } from '~/common/strings'
import { fromNow } from '~/common/time'
import network from '~/common/network'

export default {
  name: `PageValidator`,
  filters: {
    shortDecimals,
    fullDecimals,
    percent,
    noBlanks,
    fromNow,
  },
  data: () => ({
    selfStake: undefined,
    validatorDelegations: [],
  }),
  computed: {
    ...mapState('data', [
      'validators',
      'delegations',
      'rewards',
      'validatorsLoaded',
    ]),
    validator() {
      return this.validators.find(
        ({ operatorAddress }) => operatorAddress === this.address
      )
    },
    address() {
      return this.$route.params.address
    },
    delegation() {
      return this.delegations.find(
        ({ validator: { operatorAddress } }) => operatorAddress === this.address
      )
    },
    rewardsForValidator() {
      return this.rewards.filter(
        ({ validator: { operatorAddress } }) => operatorAddress === this.address
      )
    },
  },
  watch: {
    validator: {
      immediate: true,
      handler(validator) {
        if (validator) {
          this.getValidatorDelegations()
          this.getSelfStake()
        }
      },
    },
  },
  methods: {
    shortDecimals,
    fullDecimals,
    percent,
    fromNow,
    noBlanks,
    /* istanbul ignore next */
    openStakeModal() {
      this.$refs.StakeModal.open()
    },
    /* istanbul ignore next */
    openUnstakeModal() {
      this.$refs.UnstakeModal.open()
    },
    /* istanbul ignore next */
    isBlankField(field, alternateFilter) {
      return field ? alternateFilter(field) : noBlanks(field)
    },
    filterStakingDenomReward() {
      if (this.rewardsForValidator) {
        const stakingDenomRewards = this.rewardsForValidator.find(
          (reward) => reward.denom === network.stakingDenom
        )
        return stakingDenomRewards ? stakingDenomRewards.amount : 0
      }
    },
    async getSelfStake() {
      this.selfStake = await this.$store.dispatch(
        'data/getValidatorSelfStake',
        this.validator
      )
    },
    async getValidatorDelegations() {
      this.validatorDelegations = await this.$store.dispatch(
        'data/getValidatorDelegations',
        this.validator
      )
    },
  },
}
</script>
<style scoped>
.validator-container {
  margin: 2rem;
  padding: 1.5rem 2rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
  max-width: 1024px;
}

section {
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
  margin: 1rem 0;
}

.validator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 2rem;
}

.validator-header .validator-image {
  height: 4rem;
  min-height: 4rem;
  width: 4rem;
  min-width: 4rem;
}

.identity {
  display: flex;
  align-items: center;
}

.name {
  color: var(--bright);
  font-size: var(--text-3xl);
  line-height: 2rem;
  font-weight: 500;
  max-width: 600px;
  word-break: break-word;
}

.validator-info {
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  text-overflow: ellipsis;
}

h4 {
  color: var(--dim);
  font-size: var(--text-xs);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

h4,
h5 {
  font-size: var(--text-xs);
  display: inline-block;
}

h5 {
  padding-left: 0.5rem;
  color: var(--success);
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-buttons button:first-child {
  margin-right: 0.5rem;
}

.status-container {
  padding: 1rem 1rem 0;
}

section div {
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

section:not(.row) div {
  border-bottom: 1px solid var(--gray-200);
}

.row {
  display: flex;
  flex-direction: row;
}

section div:last-child {
  border-bottom: none;
}

.copyable-address {
  padding: 0;
  font-size: var(--text-base);
}

.note {
  font-size: var(--text-xs);
  color: var(--dim);
  font-style: italic;
}

@media screen and (max-width: 667px) {
  .validator-container {
    border-radius: 0;
    box-shadow: none;
    max-width: none;
    margin: 0;
  }
}

@media screen and (max-width: 767px) {
  .status-container {
    display: flex;
    justify-content: center;
  }

  .validator-info {
    padding-top: 1.5rem;
  }

  .validator-header,
  .identity {
    flex-direction: column;
    padding: 1rem 0;
  }
}

@media screen and (min-width: 1324px) {
  .validator-container {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
