<template>
  <ActionModal
    id="undelegation-modal"
    ref="actionModal"
    :amount="amount"
    :title="isRedelegation ? 'Restake' : 'Unstake'"
    class="undelegation-modal"
    :submission-error-prefix="
      isRedelegation ? 'Restaking failed' : 'Unstaking failed'
    "
    :transaction-type="
      isRedelegation
        ? lunieMessageTypes.REDELEGATE
        : lunieMessageTypes.UNDELEGATE
    "
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="undelegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
  </ActionModal>
</template>

<script>
import { mapState } from 'vuex'
import { SMALLEST } from '../../common/numbers'
import { formatAddress, validatorEntry } from '../../common/address'
import { lunieMessageTypes } from '../../common/lunie-message-types'
import network from '../../network'

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
    address: ``,
    amount: 0,
    currentNetwork: {},
    delegations: [],
    validators: [],
    toSelectedIndex: `0`,
    balance: {
      total: 0,
      available: 0,
    },
    lunieMessageTypes,
    network: ``,
    smallestAmount: SMALLEST,
    stakingDenom: ``,
  }),
  computed: {
    ...mapState([`session`]),
    maximum() {
      const delegation = this.delegations.find(
        ({ validator }) =>
          validator.operatorAddress === this.sourceValidator.operatorAddress
      )
      return delegation ? Number(delegation.amount) : 0
    },
    transactionData() {
      if (this.isRedelegation) {
        if (
          isNaN(this.amount) ||
          !this.sourceValidator.operatorAddress ||
          !this.toSelectedIndex ||
          !this.stakingDenom
        ) {
          return {}
        }
        return {
          type: lunieMessageTypes.RESTAKE,
          from: [this.sourceValidator.operatorAddress],
          to: [this.toSelectedIndex],
          amount: {
            amount: this.amount,
            denom: this.stakingDenom,
          },
        }
      } else {
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
      }
    },
    notifyMessage() {
      if (this.isRedelegation) {
        return {
          title: `Successfully restaked!`,
          body: `You have successfully restaked ${this.amount} ${this.stakingDenom}s.`,
        }
      } else {
        return {
          title: `Successfully unstaked!`,
          body: `You have successfully unstaked ${this.amount} ${this.stakingDenom}s.`,
        }
      }
    },
    fromOptions() {
      let options = []
      options = options.concat(
        this.delegations.map((delegation, index) => {
          return {
            address: delegation.validator.operatorAddress,
            maximum: Number(delegation.amount),
            key: `${delegation.validator.name} - ${formatAddress(
              delegation.validator.operatorAddress
            )}`,
            value: index + 1,
          }
        })
      )
      return options
    },
    toOptions() {
      let options = [
        // from wallet
        {
          address: this.address,
          maximum: Number(this.balance.amount),
          key: `My Wallet - ${formatAddress(this.address)}`,
          value: 0,
        },
      ]
      options = options.concat(
        this.validators
          // exclude the validator we are redelegating from
          .filter(
            (validator) =>
              validator.operatorAddress !== this.sourceValidator.operatorAddress
          )
          .map((validator) => {
            return {
              address: validator.operatorAddress,
              key: validatorEntry(validator),
              value: validator.operatorAddress,
            }
          })
      )
      return options
    },
    targetValidator() {
      return (
        this.validators.find(
          (validator) => validator.operatorAddress === this.toSelectedIndex
        ) || { status: `` }
      )
    },
    isRedelegation() {
      return this.toSelectedIndex !== `0`
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

      // update registered topics for emails as the validator set changed
      this.$store.dispatch('updateNotificationRegistrations')
    },
  },
}
</script>
