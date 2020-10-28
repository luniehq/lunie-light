<template>
  <ActionModal
    id="undelegation-modal"
    ref="actionModal"
    :amount="amount"
    title="Unstake"
    class="undelegation-modal"
    submission-error-prefix="Unstaking failed"
    :transaction-type="lunieMessageTypes.UNDELEGATE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="undelegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        :value="enhancedSourceValidator"
        type="text"
        readonly
      />
    </TmFormGroup>
    <!-- :error="$v.amount.$error && $v.amount.$invalid" -->
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix max-button">{{ stakingDenom }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <span v-if="maximum > 0" class="form-message">
        Currently staked: {{ maximum }} {{ stakingDenom }}s
      </span>
      <TmFormMsg
        v-if="maximum === 0"
        :msg="`don't have any ${stakingDenom}s delegated to this validator`"
        name="You"
        type="custom"
      />
      <!-- <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${stakingDenom}s to proceed.`"
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
      /> -->
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState } from 'vuex'
import { SMALLEST } from '~/common/numbers'
import { validatorEntry } from '~/common/address'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `unstake-modal`,
  filters: {
    validatorEntry,
  },
  props: {
    sourceValidator: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    amount: 0,
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    stakingDenom: network.stakingDenom,
  }),
  computed: {
    ...mapState(`data`, [`delegations`]),
    maximum() {
      const delegation = this.delegations.find(
        ({ validator }) =>
          validator.operatorAddress === this.sourceValidator.operatorAddress
      )
      return delegation ? Number(delegation.amount) : 0
    },
    transactionData() {
      return {
        type: lunieMessageTypes.UNSTAKE,
        from:
          this.sourceValidator && this.sourceValidator.operatorAddress
            ? [this.sourceValidator.operatorAddress]
            : null,
        amount: {
          amount: this.amount,
          denom: this.stakingDenom,
        },
      }
    },
    notifyMessage() {
      return {
        title: `Successfully unstaked!`,
        body: `You have successfully unstaked ${this.amount} ${this.stakingDenom}s.`,
      }
    },
    undelegationPeriod() {
      return network.lockUpPeriod
    },
    enhancedSourceValidator() {
      return validatorEntry(this.sourceValidator)
    },
  },
  // validations() {
  //   return {
  //     amount: {
  //       required: (amount) => {
  //         // In Polkadot we don't need to unbond tokens, the user may just want to unnominate a validator
  //         // stash accounts can't do anything else but unbond so we make it required
  //         // none accounts can't access this modal
  //         return !!amount && amount !== `0`
  //       },
  //       decimal,
  //       max: (x) => Number(x) <= this.maximum,
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

      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.maximum
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
}
</script>
