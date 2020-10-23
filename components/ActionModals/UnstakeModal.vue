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
    :disabled="session.addressRole === `stash` || isInElection"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      v-if="session.addressRole === `stash`"
      class="action-modal-form-group"
    >
      <div class="form-message notice">
        <span>
          This is a stash account, you cannot perform any unstake related
          action. To decrease the amount your stake and change your validators
          you need to sign in with your controller account
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="session.addressRole !== `stash`"
      class="action-modal-form-group"
    >
      <div class="form-message notice">
        <span v-if="isInElection">
          There is currently an ongoing election for new validator candidates.
          Unstake is not allowed by now.
        </span>
        <span v-else-if="!isRedelegation">
          Unstaking takes {{ undelegationPeriod }} to complete and cannot be
          undone. Please make sure you understand the rules of staking.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon restaking — but
          your tokens will still be subject to the risks associated with the
          original stake for the duration of the unstaking period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="isUnnomination && session.addressRole !== `stash`"
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
    <TmFormGroup
      v-if="network.network_type !== 'polkadot'"
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <TmField
        id="to"
        v-model="toSelectedIndex"
        :options="toOptions"
        type="select"
      />
      <!-- <TmFormMsg
        v-if="targetValidator.status === 'INACTIVE' && isRedelegation"
        :msg="`You are about to restake to an inactive validator (${targetValidator.statusDetailed})`"
        type="custom"
        class="tm-form-msg--desc"
      /> -->
    </TmFormGroup>
    <TmFormGroup
      v-if="
        network.network_type === `polkadot`
          ? !isUnnomination && session.addressRole !== `stash`
          : true
      "
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
      <!-- <TmFormMsg
        :msg="`don't have any ${stakingDenom}s delegated to this validator`"
        name="You"
        type="custom"
      />
      <TmFormMsg
        name="Amount"
        type="required"
      />
      <TmFormMsg
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        type="custom"
        :msg="`You don't have enough ${stakingDenom}s to proceed.`"
      />
      <TmFormMsg
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <TmFormMsg
        name="Amount"
        type="maxDecimals"
      /> -->
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState } from 'vuex'
import { decimal } from 'vuelidate/lib/validators'
import { SMALLEST } from '../../common/numbers'
import { formatAddress, validatorEntry } from '../../common/address'
import { lunieMessageTypes } from '../../common/lunie-message-types'
import network from '../../network'
import CosmosV2Source from '~/common/cosmosV2-source'

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
    isUnnomination: {
      type: Boolean,
      default: false,
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
    isInElection: false, // Handle election period in Polkadot
  }),
  computed: {
    ...mapState([`session`]),
    maximum() {
      if (network.network_type === `polkadot`) {
        const totalStaked = this.balance.total - this.balance.available
        return totalStaked.toFixed(6) || 0
      } else {
        const delegation = this.delegations.find(
          ({ validator }) =>
            validator.operatorAddress === this.sourceValidator.operatorAddress
        )
        return delegation ? Number(delegation.amount) : 0
      }
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
          addressRole: this.session.addressRole,
        }
      } else {
        if (
          isNaN(this.amount) ||
          (!this.sourceValidator.operatorAddress &&
            network.network_type !== `polkadot`) ||
          !this.stakingDenom
        ) {
          return {}
        }
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
          addressRole: this.session.addressRole,
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
  mounted() {
    this.loadData()
  },
  validations() {
    return {
      amount: {
        required: (amount) => {
          // In Polkadot we don't need to unbond tokens, the user may just want to unnominate a validator
          // stash accounts can't do anything else but unbond so we make it required
          // none accounts can't access this modal
          if (
            network.network_type === 'polkadot' &&
            ['controller', 'stash/controller'].includes(
              this.session.addressRole
            )
          ) {
            return true
          }
          return !!amount && amount !== `0`
        },
        decimal,
        max: (x) => Number(x) <= this.maximum,
        min: (x) => {
          // see required
          if (
            network.network_type === 'polkadot' &&
            ['controller', 'stash/controller'].includes(
              this.session.addressRole
            )
          ) {
            return true
          }
          return Number(x) >= SMALLEST
        },
        maxDecimals: (x) => {
          return x.toString().split('.').length > 1
            ? x.toString().split('.')[1].length <= 6
            : true
        },
      },
    }
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
    async loadData() {
      const address = this.session ? this.session.address : undefined
      const currency = this.$cookies.get('currency') || 'USD' // TODO move to store
      if (address) {
        const _store = {}
        const api = new CosmosV2Source(this.$axios, network, _store, null, null)
        const balances = await api.getBalancesV2FromAddress(
          address,
          currency,
          network
        )
        this.balance = balances.find(
          ({ denom }) => denom === network.stakingDenom
        )
      }
    },
  },
}
</script>
