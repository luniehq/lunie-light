<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :validate="validateForm"
    :amounts="amounts"
    title="Send"
    submission-error-prefix="Sending tokens failed"
    :transaction-type="lunieMessageTypes.SEND"
    :transaction-data="transactionData"
    :selected-denom="amounts.map(({ denom }) => denom)"
    :notify-message="notifyMessage"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <FormGroup
      :error="$v.address.$error && $v.address.$invalid"
      class="action-modal-form-group"
      field-id="send-address"
      field-label="Send To"
    >
      <Field
        id="send-address"
        ref="sendAddress"
        v-model="address"
        v-focus
        type="text"
        placeholder="Address"
        @change.native="trimSendAddress"
        @keyup.enter.native="refocusOnAmount"
      />
      <FormMessage
        v-if="$v.address.$error && !$v.address.required"
        name="Address"
        type="required"
      />
      <FormMessage
        v-else-if="$v.address.$error && !$v.address.addressValidate"
        name="Address"
        type="custom"
        :msg="addressError"
      />
    </FormGroup>
    <FormGroup
      v-for="(amount, index) in amounts"
      id="form-group-amount"
      :key="amount.denom"
      :error="$v.amounts.$error && $v.amounts.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      :field-label="index === 0 ? `Amount` : ``"
    >
      <div class="row">
        <Field
          v-model="amount.amount"
          class="amount"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <Field
          v-model="amount.denom"
          :title="`Select the token you wish to use`"
          :options="denomOptions | availableDenoms(index, amounts)"
          class="tm-field-token-selector"
          type="select"
        />
      </div>

      <FormMessage
        v-if="$v.amounts.$error && (!$v.amounts.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <FormMessage
        v-else-if="$v.amounts.$error && !$v.amounts.decimal"
        name="Amount"
        type="numeric"
      />
      <FormMessage
        v-else-if="$v.amounts.$error && !$v.amounts.max"
        type="custom"
        :msg="`You don't have enough ${amounts.map(
          ({ denom }) => denom
        )} to proceed.`"
      />
      <FormMessage
        v-else-if="$v.amounts.$error && !$v.amounts.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <FormMessage
        v-else-if="$v.amounts.$error && !$v.amounts.maxDecimals"
        name="Amount"
        type="maxDecimals"
      />
      <FormMessage
        v-else-if="isMaxAmount(index)"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc max-message"
      />
      <!-- <FormMessage
        v-else-if="duplicateDenoms()"
        msg="It is only possible to send one amount per currency"
        type="custom"
        class="tm-form-msg--desc max-message"
      /> -->
      <div
        v-if="index === amounts.length - 1 && denoms.length > 1"
        class="manage-amounts-container"
      >
        <div
          v-if="amounts.length > 1"
          class="add-amount-button"
          @click="removeAmount(index)"
        >
          <i class="material-icons notranslate">remove_circle</i>
        </div>
        <div
          v-if="getAvailableDenoms(denomOptions, index, amounts).length > 1"
          class="add-amount-button"
          @click="addAmount(index + 1)"
        >
          <i class="material-icons notranslate">add_circle</i>
        </div>
      </div>
    </FormGroup>
    <FormGroup
      id="memo"
      :error="$v.memo.$error && $v.memo.$invalid"
      class="action-modal-group"
      field-id="memo"
      field-label="Memo"
    >
      <Field
        id="memo"
        v-model="memo"
        type="text"
        @keyup.enter.native="enterPressed"
      />
      <FormMessage
        v-if="$v.memo.$error && !$v.memo.maxLength"
        name="Memo"
        type="maxLength"
        :max="max_memo_characters"
      />
    </FormGroup>
  </ActionModal>
</template>

<script>
import { required, decimal, maxLength } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import BigNumber from 'bignumber.js'
import { SMALLEST } from '~/common/numbers'
import { formatAddress, decodeB32 } from '~/common/address'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

const defaultMemo = ''

function availableDenoms(denoms, index, amounts) {
  return denoms.filter(
    ({ key: denom }) =>
      (amounts[index] && amounts[index].denom === denom) ||
      !amounts.find((amount) => amount.denom === denom)
  )
}

export default {
  name: `SendModal`,
  filters: {
    availableDenoms,
  },
  props: {
    denoms: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    address: ``,
    amounts: [
      {
        amount: null,
        denom: ``,
      },
    ],
    addressError: ``,
    memo: defaultMemo,
    max_memo_characters: 256,
    isFirstLoad: true,
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    networkFeesLoaded: false,
    network,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapState(`data`, [`balances`]),
    transactionData() {
      if (this.amounts.find(({ amount }) => isNaN(amount)) || !this.session) {
        return {}
      }
      return {
        type: lunieMessageTypes.SEND,
        to: [this.address],
        from: [this.session.address],
        amounts: this.amounts,
        memo: this.memo,
      }
    },
    denomOptions(index) {
      return this.denoms
        ? this.denoms.map((denom) => ({ key: denom, value: denom }))
        : []
    },
    notifyMessage() {
      return {
        title: `Successful Send`,
        body: `Successfully sent to ${formatAddress(this.address)}`,
      }
    },
  },
  methods: {
    open(denom = undefined) {
      this.amounts = [{ amount: '', denom: denom || this.denoms[0] }]
      this.$v.$reset()
      this.$refs.actionModal.open()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
    validateForm() {
      this.$v.$touch()
      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.address = undefined
      this.amounts = [
        {
          amount: 0,
          denom: this.denoms[0],
        },
      ]
      this.memo = defaultMemo
      this.sending = false
    },
    isMaxAmount(index) {
      const selectedBalance = this.getSelectedBalance(this.denoms[index])
      if (selectedBalance.available === 0) {
        return false
      } else {
        return (
          parseFloat(this.amounts[index].amount) === selectedBalance.available
        )
      }
    },
    bech32Validation(address) {
      try {
        decodeB32(address)
        return true
      } catch (error) {
        this.addressError = String(error).slice(7)
        return false
      }
    },
    prefixValidation(address) {
      if (address && address.startsWith(this.network.addressPrefix)) {
        return true
      } else {
        this.addressError = `prefix does not match this network's prefix`
        return false
      }
    },
    validatorAddressValidation(address) {
      if (address && address.includes('valoper')) {
        this.addressError = `Validator addresses are not supported`
        return false
      } else {
        return true
      }
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    trimSendAddress() {
      this.address = this.$refs.sendAddress.value.trim()
    },
    refocusOnAmount() {
      this.$refs.amount.$el.focus()
    },
    maxDecimals(value, decimals) {
      return Number(BigNumber(value).toFixed(decimals)) // TODO only use bignumber
    },
    getSelectedBalance(selectedDenom) {
      return (
        this.balances.find(({ denom }) => denom === selectedDenom) || {
          amount: 0,
        }
      )
    },
    getAvailableDenoms(denomOptions, index, amounts) {
      return availableDenoms(denomOptions, index, amounts)
    },
    removeAmount(index) {
      this.amounts.pop()
    },
    addAmount(index) {
      const denoms = availableDenoms(this.denomOptions, index, this.amounts)
      this.amounts.push({
        amount: 0,
        denom: denoms[0].key,
      })
    },
  },
  validations() {
    return {
      address: {
        required,
        bech32Validation: this.bech32Validation,
        prefixValidation: this.prefixValidation,
        validatorAddressValidation: this.validatorAddressValidation,
      },
      amounts: {
        required: (x) =>
          this.amounts.filter(({ amount }) => required(amount)).length ===
          this.amounts.length,
        decimal: (x) =>
          this.amounts.filter(({ amount }) => decimal(amount)).length ===
          this.amounts.length,
        max: (x) =>
          this.amounts.filter(
            (amount) =>
              Number(amount.amount) <=
              this.getSelectedBalance(amount.denom).available
          ).length === this.amounts.length,
        min: (x) =>
          this.amounts.filter(({ amount }) => Number(amount) >= SMALLEST)
            .length === this.amounts.length,
        maxDecimals: (x) => {
          const amountsWithDecimals = this.amounts.filter(
            ({ amount }) => Number(amount).toString().split('.').length > 1
          )
          return amountsWithDecimals.length > 0
            ? amountsWithDecimals.filter(
                ({ amount }) =>
                  Number(amount).toString().split('.')[1].length <= 6
              ).length === amountsWithDecimals.length
            : true
        },
      },
      denoms: { required },
      memo: {
        maxLength: maxLength(this.max_memo_characters),
      },
    }
  },
}
</script>
<style scoped>
.memo-span {
  font-size: var(--text-xs);
  font-style: italic;
}

.manage-amounts-container {
  display: flex;
  justify-content: flex-end;
}

.add-amount-button {
  text-align: right;
  color: var(--primary);
  cursor: pointer;
  margin-left: 1rem;
}

.add-amount-button i {
  font-size: 1.75rem;
  padding-top: 0.5rem;
}

.add-amount-button:hover {
  color: var(--secondary);
}
</style>
