<template>
  <ActionModal
    id="modal-deposit"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Deposit"
    class="modal-deposit"
    submission-error-prefix="Depositing failed"
    :transaction-type="lunieMessageTypes.DEPOSIT"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="deposit"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <FormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <Field
        id="amount"
        v-model="amount"
        v-focus
        :disabled="network.network_type === `polkadot`"
        type="number"
        placeholder="0"
      />
      <FormMessage
        v-if="balance.amount === 0"
        :msg="`doesn't have any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <FormMessage
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${denom}s to proceed.`"
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
    </FormGroup>
  </ActionModal>
</template>

<script>
import { SMALLEST, decimal } from '~/common/numbers'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `ModalDeposit`,
  props: {
    proposalId: {
      type: [Number, String],
      required: true,
    },
    proposalTitle: {
      type: String,
      required: true,
    },
    denom: {
      type: String,
      required: true,
    },
    deposits: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    amount: null,
    balance: {
      amount: null,
      denom: ``,
    },
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    network,
  }),
  computed: {
    transactionData() {
      if (isNaN(this.amount) || !this.proposalId || !this.denom) {
        return {}
      }
      return {
        type: lunieMessageTypes.DEPOSIT,
        proposalId: this.proposalId,
        amount: {
          amount: this.amount,
          denom: this.denom,
        },
        depositsCount: this.deposits.length,
      }
    },
    notifyMessage() {
      return {
        title: `Successful deposit!`,
        body: `You have successfully deposited your ${this.denom}s on proposal #${this.proposalId}`,
      }
    },
  },
  validations() {
    return {
      amount: {
        required: (x) => !!x && x !== `0`,
        decimal,
        max: (x) => Number(x) <= this.balance.amount,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          if (x) {
            return x.toString().split('.').length > 1
              ? x.toString().split('.')[1].length <= 6
              : true
          } else {
            return false
          }
        },
      },
    }
  },
  methods: {
    open() {
      if (this.network.network_type === `polkadot`) {
        this.amount = this.deposits[0].amount[0].amount
      }
      this.$refs.actionModal.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.amount = 0
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
}
</script>
