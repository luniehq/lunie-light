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
  </ActionModal>
</template>

<script>
import { mapState } from 'vuex'
// import { decimal } from 'vuelidate/lib/validators'
import { SMALLEST } from '../../common/numbers'
import { formatAddress, validatorEntry } from '../../common/address'
import { lunieMessageTypes } from '../../common/lunie-message-types'
import network from '../../network'

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
    address: ``,
    amount: 0,
    fromSelectedIndex: 0,
    balance: {
      amount: null,
      denom: ``,
    },
    currentNetwork: {},
    validators: [],
    delegations: [],
    undelegations: [],
    undelegationsLoaded: false,
    lunieMessageTypes,
    network: ``,
    smallestAmount: SMALLEST,
  }),
  computed: {
    ...mapState([`session`]),
    stakedBalance() {
      // balances not loaded yet
      if (!this.balance) {
        return {
          total: 0,
          denom: network.stakingDenom,
        }
      }
      let stakedAmount =
        Number(this.balance.total) - Number(this.balance.amount)
      // substract the already unbonding balance in the case of Substrate networks.
      if (this.undelegationsLoaded && this.undelegations.length > 0) {
        stakedAmount = this.undelegations.reduce(
          (stakedAmount, { amount }) => stakedAmount - Number(amount),
          stakedAmount
        )
      }
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
        this.delegations
          // exclude target validator
          .filter(
            (delegation) =>
              delegation.validator.operatorAddress !==
              this.targetValidator.operatorAddress
          )
          .map((delegation, index) => {
            return {
              address: delegation.validator.operatorAddress,
              maximum: Number(delegation.amount),
              key: validatorEntry(delegation.validator),
              value: index + 1,
            }
          })
      )

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

      // update registered topics for emails as the validator set changed
      this.$store.dispatch('updateNotificationRegistrations')
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
