<template>
  <div>
    <div v-if="!validatorsLoaded">
      <Loader />
    </div>
    <div v-else-if="validators.length && !validator">Validator Not Found</div>
    <div v-else class="readable-width">
      <div class="back-button-container">
        <BackButton />
      </div>
      <div class="status-container">
        <Status :label="validator.status" />
      </div>
      <tr class="li-validator">
        <td class="data-table__row__info">
          <div class="li-validator-name-row">
            <Avatar
              v-if="!validator.picture || validator.picture === 'null'"
              class="li-validator-image"
              alt="generic geometric symbol - generated avatar from address"
              :address="validator.operatorAddress"
            />
            <img
              v-else-if="validator.picture"
              :src="validator.picture"
              :alt="`validator logo for ` + validator.name"
              class="li-validator-image"
            />
            <div class="validator-info">
              <h3 class="li-validator-name">{{ validator.name }}</h3>
              <div v-if="delegation && delegation.amount">
                <h4>{{ delegation.amount | fullDecimals }}</h4>
                <h5 v-if="rewards && rewards.length > 0">
                  +{{ filterStakingDenomReward() | noBlanks }}
                </h5>
              </div>
            </div>
          </div>
        </td>
      </tr>

      <div class="action-button-container">
        <Button
          id="delegation-btn"
          :value="`Stake`"
          @click.native="onDelegation"
        />
        <Button
          id="undelegation-btn"
          class="undelegation-btn"
          :disabled="!delegation"
          :value="`Unstake`"
          type="secondary"
          @click.native="onUndelegation"
        />
      </div>

      <ul class="row">
        <li class="column">
          <h4>Description</h4>
          <span>{{ validator.details | noBlanks }}</span>
        </li>
        <li class="column">
          <h4>Website</h4>
          <span v-if="validator.website">
            <a
              id="validator-website"
              :href="validator.website + `?ref=lunie`"
              target="_blank"
              rel="nofollow noreferrer noopener"
              >{{ validator.website }}</a
            >
          </span>
          <span v-else id="validator-website">
            {{ validator.website | noBlanks }}
          </span>
        </li>
        <li class="column">
          <h4>Validator Address</h4>
          <span>
            <Address :address="validator.operatorAddress" />
          </span>
        </li>
      </ul>

      <ul class="row">
        <li>
          <h4>Rewards</h4>
          <span id="page-profile__rewards">
            {{ validator.expectedReturns | percent }}
          </span>
        </li>
        <li>
          <h4>Voting Power / Total Stake</h4>
          <span id="page-profile__power">
            {{ validator.votingPower | percent }} /
            {{ validator.tokens | shortDecimals }}
          </span>
        </li>
        <li>
          <h4>Self Stake</h4>
          <span id="page-profile__self-bond">
            {{ selfStake | shortDecimals }} /
            {{ (selfStake / validator.tokens || 0) | percent }}
          </span>
        </li>
        <li>
          <h4>Validator Since</h4>
          <span>Block #{{ validator.startHeight || 0 }}</span>
        </li>
        <li>
          <h4>Uptime</h4>
          <span id="page-profile__uptime">{{
            isBlankField(validator.uptimePercentage, percent)
          }}</span>
        </li>
        <li>
          <h4>Current Commission Rate</h4>
          <span>{{ isBlankField(validator.commission, percent) }}</span>
        </li>
        <li>
          <h4>Max Commission Rate</h4>
          <span>{{ isBlankField(validator.maxCommission, percent) }}</span>
        </li>
        <li>
          <h4>Max Daily Commission Change</h4>
          <span>{{
            isBlankField(validator.maxChangeCommission, percent)
          }}</span>
        </li>
        <li>
          <h4>Last Commission Change</h4>
          <span>{{
            isBlankField(validator.commissionUpdateTime, fromNow)
          }}</span>
        </li>
        <li>
          <h4>Number of Stakers</h4>
          <span>{{ validatorDelegations.length }}</span>
        </li>
      </ul>

      <LazyStakeModal ref="stakeModal" :target-validator="validator" />
      <LazyUnstakeModal
        ref="unstakeModal"
        :source-validator="validator"
        :is-unnomination="true"
      />
    </div>
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
    validator(validator) {
      if (validator) {
        this.getSelfStake()
        this.getValidatorDelegations()
      }
    },
  },
  methods: {
    shortDecimals,
    fullDecimals,
    percent,
    fromNow,
    noBlanks,
    /* istanbul ignore next */
    onDelegation() {
      this.$refs.stakeModal.open()
    },
    /* istanbul ignore next */
    onUndelegation() {
      this.$refs.unstakeModal.open()
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

span {
  font-size: var(--text-xs);
  line-height: normal;
}

.li-validator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--bc-dim);
}

.li-validator-image {
  border-radius: 50% !important;
  height: 4rem !important;
  width: 4rem !important;
}

.li-validator-name {
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
  padding-left: 1rem;
  text-overflow: ellipsis;
}

h4 {
  color: var(--dim);
  font-size: var(--text-xs);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.li-validator h4,
.li-validator h5 {
  font-size: var(--text-xs);
  display: inline-block;
}

.li-validator h5 {
  padding-left: 0.5rem;
  color: var(--success);
}

.li-validator > .data-table__row__info {
  display: block;
  width: 100%;
}

.li-validator .li-validator-name-row {
  display: flex;
  align-items: center;
}

.back-button-container {
  display: flex;
  padding: 0 1rem;
}

.button-container {
  justify-content: space-between;
}

.button-container,
.action-button-container {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
}

.action-button-container {
  border-bottom: 1px solid var(--bc-dim);
}

.action-button-container button:first-child,
.button-container button:first-child {
  margin-right: 0.5rem;
}

.status-container {
  padding: 1rem 1rem 0;
}

.page {
  position: relative;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem 0 0;
}

.readable-width {
  max-width: 800px;
  margin: 1rem auto;
}

.page.dark-background {
  background: var(--app-fg);
}

.column {
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: normal;
  width: 100%;
}

.row {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 0 1rem;
}

.page-profile__section {
  margin-bottom: 1rem;
}

.page-profile__section-title {
  margin: 0 0 0.25rem 1rem;
  color: var(--txt);
  font-size: var(--text-sm);
  font-weight: 500;
}

li {
  width: 100%;
  padding: 1rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

li:last-child {
  border-bottom: none;
}

.row span {
  color: var(--bright);
  font-size: var(--text-sm);
  font-weight: 400;
}

@media screen and (max-width: 667px) {
  .button-container {
    width: 100%;
    padding: 0 1rem;
  }

  .button-container button,
  .action-button-container button {
    width: 50%;
  }
}
</style>
