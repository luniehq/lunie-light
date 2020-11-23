<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amounts="[{ amount, denom: stakingDenom }]"
    title="Stake"
    class="delegation-modal"
    submission-error-prefix="Staking failed"
    :transaction-type="lunieMessageTypes.STAKE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="delegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <FormGroup
      v-if="Object.keys(targetValidator).length > 0"
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <Field id="to" :value="enhancedTargetValidator" type="text" readonly />
    </FormGroup>

    <FormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <div class="row">
        <Field
          id="amount"
          v-model="amount"
          v-focus
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <Button
          type="button"
          class="secondary addon-max"
          value="Max"
          @click.native="setMaxAmount()"
        />
      </div>
      <span class="form-message">
        Available to stake:
        {{ maxAmount }}
        {{ network.stakingDenom }}
      </span>
      <FormMessage
        v-if="balance.available === '0'"
        :msg="`doesn't have any ${network.stakingDenom}s`"
        name="Wallet"
        type="custom"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <FormMessage
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${network.stakingDenom} to proceed.`"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.maxDecimals"
        name="Amount"
        type="maxDecimals"
      />
      <FormMessage
        v-else-if="isMaxAmount()"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc"
      />
    </FormGroup>
  </ActionModal>
</template>

<script>
import { mapState } from 'vuex'
import { required, decimal } from 'vuelidate/lib/validators'
import { SMALLEST } from '~/common/numbers'
import { formatAddress, validatorEntry } from '~/common/address'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `StakeModal`,
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
    amount: null,
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
    },
    notifyMessage() {
      return {
        title: `Successfully staked!`,
        body: `You have successfully staked your ${network.stakingDenom}s`,
      }
    },
    maxAmount() {
      return this.balance.available
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
    validateForm() {
      this.$v.$touch()
      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.fromSelectedIndex = 0
      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.maxAmount
    },
    isMaxAmount() {
      if (this.balance.amount === 0) {
        return false
      } else {
        return parseFloat(this.amount) === this.maxAmount
      }
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
  validations() {
    return {
      amount: {
        required,
        decimal,
        max: (x) => Number(x) <= this.maxAmount,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          return Number(x).toString().split('.').length > 1
            ? Number(x).toString().split('.')[1].length <= 6
            : true
        },
      },
    }
  },
}
</script>
