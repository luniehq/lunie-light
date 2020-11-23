<template>
  <ActionModal
    id="modal-withdraw-rewards"
    ref="actionModal"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    :selected-denom="feeDenom"
    title="Claim Rewards"
    class="modal-withdraw-rewards"
    submission-error-prefix="Withdrawal failed"
    feature-flag="claim_rewards"
    :transaction-type="lunieMessageTypes.CLAIM_REWARDS"
    :rewards="rewards"
    :disable="validatorsWithRewards"
  >
    <span
      v-if="session.sessionType === SESSION_TYPES.LEDGER"
      class="form-message withdraw-limit"
    >
      Lunie will only withdraw rewards from 5 validators at a time because of a
      limitation with the Ledger&nbsp;Nano.
    </span>
    <FormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-title="Amount"
    >
      <div v-for="reward in totalRewards" :key="reward.denom" class="row">
        <Field
          :value="reward.amount | fullDecimals"
          :add-on="reward.denom"
          :is-disabled="true"
        />
      </div>
    </FormGroup>
  </ActionModal>
</template>

<script>
import { mapState } from 'vuex'
import { fullDecimals } from '~/common/numbers'
import { getRewardsValidators } from '~/common/ledger'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

const SESSION_TYPES = {
  LOCAL: `local`,
  LEDGER: `ledger`,
  EXTENSION: `extension`,
  EXPLORE: `explore`,
}

function rewardsToDictionary(rewards) {
  return rewards.reduce((all, reward) => {
    return {
      ...all,
      [reward.denom]: Number(reward.amount) + (all[reward.denom] || 0),
    }
  }, {})
}

export default {
  name: `ClaimModal`,
  filters: {
    fullDecimals,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
    rewards: {
      type: Array,
      required: true,
    },
    balances: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    getRewardsValidators,
    lunieMessageTypes,
    SESSION_TYPES,
    network,
  }),
  computed: {
    ...mapState(['session']),
    transactionData() {
      if (this.totalRewards.length === 0) return {}
      return {
        type: lunieMessageTypes.CLAIM_REWARDS,
        amounts: this.totalRewards,
        from: this.validators,
      }
    },
    validators() {
      if (this.rewards && this.rewards.length > 0) {
        // Ledger has a limitation that prevents claiming from more than 5 validators
        const top5 = this.session.sessionType === SESSION_TYPES.LEDGER
        const validators = this.getRewardsValidators(this.rewards, top5)
        return validators
      } else {
        return []
      }
    },
    notifyMessage() {
      return {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`,
      }
    },
    validatorsWithRewards() {
      if (this.rewards) {
        return this.rewards.length > 0
      } else {
        return false
      }
    },
    feeDenom() {
      // since it is cheaper to pay fees with the staking denom, we return this denom
      // as default if there is any available balance. Otherwise, we return the first balance over 0
      // TODO: change to be preferrably the same token that is shown as claimed, although not so important
      if (this.balances && this.balances.length > 0) {
        const nonZeroBalances = this.balances.filter(({ amount }) => amount > 0)
        const stakingDenomBalance = nonZeroBalances.find(
          ({ denom }) => denom === this.stakingDenom
        )
        return stakingDenomBalance
          ? stakingDenomBalance.denom
          : nonZeroBalances.length > 0
          ? nonZeroBalances[0].denom
          : this.stakingDenom
      } else {
        return this.stakingDenom
      }
    },
    totalRewards() {
      const filteredRewards = this.rewards.filter(({ validator }) => {
        return this.validators.includes(validator.operatorAddress)
      })
      const validatorsRewardsObject = rewardsToDictionary(filteredRewards)
      const rewardsDenomArray = Object.entries(validatorsRewardsObject)
      return rewardsDenomArray
        .map(([denom, amount]) => ({ denom, amount }))
        .sort((a, b) => b.amount - a.amount)
    },
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
  },
}
</script>
