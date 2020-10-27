<template>
  <TmPage
    data-title="Validator"
    :empty="!validator"
    :loading="loading"
    :empty-title="`Validator not found`"
    :empty-subtitle="`There must be a typo somewhere.`"
    class="readable-width"
  >
    <template v-if="validator">
      <div class="button-container">
        <BackButton />
      </div>
      <div class="status-button-container">
        <div class="status-container">
          <span
            :class="validator.status || `` | toLower"
            class="validator-status"
          >
            {{ validator.status }}
          </span>
          <span
            v-if="validator.statusDetailed"
            class="validator-status-detailed"
            >{{ validator.statusDetailed }}</span
          >
        </div>
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
        <TmBtn
          id="delegation-btn"
          :value="`Stake`"
          @click.native="onDelegation"
        />
        <TmBtn
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
      </ul>

      <LazyStakeModal ref="stakeModal" :target-validator="validator" />
      <LazyUnstakeModal
        ref="unstakeModal"
        :source-validator="validator"
        :is-unnomination="true"
      />
    </template>
  </TmPage>
</template>

<script>
import { mapState } from 'vuex'
import { shortDecimals, fullDecimals, percent } from '~/common/numbers'
import { noBlanks } from '~/common/strings'
import { fromNow } from '~/common/time'
import network from '~/common/network'

export default {
  name: `page-validator`,
  filters: {
    shortDecimals,
    fullDecimals,
    percent,
    toLower: (text) => text.toLowerCase(),
    noBlanks,
    fromNow,
  },
  props: {
    showOnMobile: {
      type: String,
      default: () => 'returns',
    },
  },
  data: () => ({
    loading: true,
    selfStake: undefined,
  }),
  computed: {
    ...mapState('data', ['validators', 'delegations', 'rewards']),
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
      debugger
      this.selfStake = await this.$store.dispatch(
        'data/getValidatorSelfStake',
        this.validator
      )
    },
  },
}
</script>
<style scoped>
.back-button,
.tutorial-button {
  padding: 0.5rem 1rem;
  width: auto;
  font-size: 14px;
  background: transparent;
  color: #7a88b8;
  border: 2px solid rgb(122, 136, 184, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: var(--sans);
}

.back-button i {
  padding-right: 1rem;
}

.back-button i,
.tutorial-button i {
  font-size: 1rem;
}

span {
  font-size: 12px;
  line-height: normal;
}

.tutorial-button span {
  font-size: 14px;
}

.back-button:hover,
.tutorial-button:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.li-validator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--bc-dim);
}

.li-validator-image {
  border-radius: 50%;
  height: 4rem;
  width: 4rem;
}

.li-validator-name {
  color: var(--bright);
  font-size: var(--h1);
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

.li-validator h4,
.li-validator h5 {
  font-size: var(--sm);
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

.validator-status {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid;
  padding: 2px 4px;
  border-radius: 0.25rem;
}

.validator-status.inactive {
  color: var(--warning);
  border-color: var(--warning);
}

.validator-status.active {
  color: var(--success);
  border-color: var(--success);
}

.validator-status-detailed,
.no-img-info {
  display: block;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--dim);
}

@media screen and (max-width: 425px) {
  .status-button-container {
    display: flex;
    flex-direction: column-reverse;
  }
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
