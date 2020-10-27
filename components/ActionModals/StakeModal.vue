<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :amount="isRedelegation ? 0 : amount"
    :title="isRedelegation ? 'Restake' : 'Stake'"
    class="delegation-modal"
    submission-error-prefix="Staking failed"
    :transaction-type="
      isRedelegation ? lunieMessageTypes.RESTAKE : lunieMessageTypes.STAKE
    "
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="delegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span v-if="isRedelegation">
          Voting power and rewards will change instantly upon restaking — but
          your tokens will still be subject to the risks associated with the
          original stake for the duration of the unstaking period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="Object.keys(targetValidator).length > 0"
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <TmField id="to" :value="enhancedTargetValidator" type="text" readonly />
      <template>
        <!-- <TmFormMsg
          v-if="targetValidator.status === 'INACTIVE' && !isRedelegation"
          :msg="`You are about to stake to an inactive validator (${targetValidator.statusDetailed})`"
          type="custom"
          class="tm-form-msg--desc"
        />
        <TmFormMsg
          v-if="targetValidator.status === 'INACTIVE' && isRedelegation"
          :msg="`You are about to restake to an inactive validator (${targetValidator.statusDetailed})`"
          type="custom"
          class="tm-form-msg--desc"
        /> -->
      </template>
    </TmFormGroup>

    <!-- :error="$v.amount.$error && $v.amount.$invalid" -->
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix max-button">{{ network.stakingDenom }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          placeholder="0"
          class="tm-field-addon"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          :disabled="session.addressRole === `controller`"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <span class="form-message">
        Available to stake:
        {{ maxAmount }}
        {{ network.stakingDenom }}s
      </span>
      <TmFormMsg
        v-if="balance.available === '0'"
        :msg="`doesn't have any ${network.stakingDenom}s`"
        name="Wallet"
        type="custom"
      />
      <!-- <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${currentNetwork.stakingDenom}s to proceed.`"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.maxDecimals"
        name="Amount"
        type="maxDecimals"
      />
      <TmFormMsg
        v-else-if="isMaxAmount() && !isRedelegation"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc"
      /> -->
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState } from 'vuex'
// import { decimal } from 'vuelidate/lib/validators'
import { SMALLEST } from '~/common/numbers'
import { formatAddress, validatorEntry } from '~/common/address'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `stake-modal`,
  filters: {
    validatorEntry,
  },
  props: {
    targetValidator: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    amount: 0,
    fromSelectedIndex: 0,
    lunieMessageTypes,
    network,
    smallestAmount: SMALLEST,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapState(`data`, [`balances`]),
    address() {
      return this.session ? this.session.address : ''
    },
    balance() {
      return (
        this.balances.find(({ denom }) => denom === network.stakingDenom) || {
          available: 0,
          denom: network.stakingDenom,
        }
      )
    },
    stakedBalance() {
      const stakedAmount =
        Number(this.balance.total) - Number(this.balance.amount)
      return {
        total: Number(stakedAmount),
        denom: network.stakingDenom,
      }
    },
    toOptions() {
      return this.validators
        .filter(
          (validator) =>
            validator.operatorAddress === this.targetValidator.operatorAddress
        )
        .map((validator) => {
          return {
            address: validator.operatorAddress,
            key: `${validator.name} - ${formatAddress(
              validator.operatorAddress
            )}`,
            value: 0,
          }
        })
    },
    fromOptions() {
      const options = [
        // from wallet
        {
          address: this.address,
          maximum: Number(this.balance.available),
          key: `My Wallet - ${formatAddress(this.address)}`,
          value: 0,
        },
      ]

      return options
    },
    from() {
      if (!this.session.signedIn) return ``

      return this.fromOptions[this.fromSelectedIndex].address
    },
    transactionData() {
      if (isNaN(this.amount)) return {}

      if (this.isRedelegation) {
        return {
          type: lunieMessageTypes.RESTAKE,
          from: [this.from],
          to:
            Object.keys(this.targetValidator).length > 0
              ? [this.targetValidator.operatorAddress]
              : '',
          amount: {
            amount: this.amount,
            denom: network.stakingDenom,
          },
        }
      } else {
        return {
          type: lunieMessageTypes.STAKE,
          to:
            Object.keys(this.targetValidator).length > 0
              ? [this.targetValidator.operatorAddress]
              : '',
          amount: {
            amount: this.amount,
            denom: network.stakingDenom,
          },
        }
      }
    },
    notifyMessage() {
      if (this.isRedelegation) {
        return {
          title: `Successfully restaked!`,
          body: `You have successfully restaked your ${network.stakingDenom}s`,
        }
      } else {
        return {
          title: `Successfully staked!`,
          body: `You have successfully staked your ${network.stakingDenom}s`,
        }
      }
    },
    maxAmount() {
      return this.fromOptions[this.fromSelectedIndex].maximum
    },
    isRedelegation() {
      return this.fromSelectedIndex !== 0 && this.fromSelectedIndex !== '0' // where are these 0 strings comming from?
    },
    undelegationPeriod() {
      return network.lockUpPeriod
    },
    stakingDenom() {
      return network.stakingDenom
    },
    enhancedTargetValidator() {
      return validatorEntry(this.targetValidator)
    },
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    // validateForm() {
    //   this.$v.$touch()
    //   return !this.$v.$invalid
    // },
    clear() {
      // this.$v.$reset()
      this.fromSelectedIndex = 0
      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.maxAmount
    },
    isMaxAmount() {
      return parseFloat(this.amount) === parseFloat(this.maxAmount)
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
  // validations() {
  //   return {
  //     amount: {
  //       required: (amount) => {
  //         // In Polkadot we don't need to bond extra, the user may just want to nominate a new validator
  //         // stash accounts or new accounts that haven't bonded tokens yet, need to specify an amount to bond
  //         return !!amount && amount !== `0`
  //       },
  //       decimal,
  //       max: (x) => Number(x) <= this.maxAmount,
  //       min: (x) => {
  //         return Number(x) >= SMALLEST
  //       },
  //       maxDecimals: (x) => {
  //         return x.toString().split('.').length > 1
  //           ? x.toString().split('.')[1].length <= 6
  //           : true
  //       },
  //     },
  //   }
  // },
}
</script>
