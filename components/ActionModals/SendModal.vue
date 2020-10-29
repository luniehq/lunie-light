<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amounts"
    title="Send"
    submission-error-prefix="Sending tokens failed"
    :transaction-type="lunieMessageTypes.SEND"
    :transaction-data="transactionData"
    :selected-denom="selectedTokens"
    :notify-message="notifyMessage"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      :error="$v.address.$error && $v.address.$invalid"
      class="action-modal-form-group"
      field-id="send-address"
      field-label="Send To"
    >
      <TmField
        id="send-address"
        ref="sendAddress"
        v-model="address"
        v-focus
        type="text"
        placeholder="Address"
        @change.native="trimSendAddress"
        @keyup.enter.native="refocusOnAmount"
      />
      <TmFormMsg
        v-if="$v.address.$error && !$v.address.required"
        name="Address"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.address.$error && !$v.address.addressValidate"
        name="Address"
        type="custom"
        :msg="addressError"
      />
    </TmFormGroup>
    <TmFormGroup
      v-for="(amount, index) in amounts"
      id="form-group-amount"
      :key="`${amount.amount}-${amount.denom}-${index}`"
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      :field-label="index === 0 ? `Amount` : ``"
    >
      <TmFieldGroup>
        <TmField
          id="amount"
          ref="amount"
          v-model="amounts[index].amount"
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmField
          id="token"
          v-model="selectedTokens[index]"
          :title="`Select the token you wish to use`"
          :options="getDenoms"
          class="tm-field-token-selector"
          placeholder="Select the token"
          type="select"
        />
        <TmBtn
          type="button"
          class="addon-max"
          value="Max"
          @click.native="setMaxAmount(index)"
        />
      </TmFieldGroup>

      <TmFormMsg
        v-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <!-- <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${selectedTokens} to proceed.`"
      /> -->
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
        v-else-if="isMaxAmount(index)"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc max-message"
      />
    </TmFormGroup>
    <div class="add-amount-button" @click="addAmount()">
      <i class="material-icons notranslate">add_circle</i>
    </div>
    <TmFormGroup
      id="memo"
      :error="$v.memo.$error && $v.memo.$invalid"
      class="action-modal-group"
      field-id="memo"
      field-label="Memo"
    >
      <TmField
        id="memo"
        v-model="memo"
        type="text"
        @keyup.enter.native="enterPressed"
      />
      <TmFormMsg
        v-if="$v.memo.$error && !$v.memo.maxLength"
        name="Memo"
        type="maxLength"
        :max="max_memo_characters"
      />
    </TmFormGroup>
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

export default {
  name: `send-modal`,
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
        amount: 0,
        denom: ``,
      },
    ],
    selectedTokens: [],
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
        amount: this.amounts,
        memo: this.memo,
      }
    },
    notifyMessage() {
      return {
        title: `Successful Send`,
        body: `Successfully sent ${this.amounts.map(
          ({ amount }) => amount
        )} ${this.amounts.map(({ denom }) => denom)}s to ${formatAddress(
          this.address
        )}`,
      }
    },
    getDenoms() {
      return this.denoms
        ? this.denoms.map((denom) => (denom = { key: denom, value: denom }))
        : []
    },
  },
  methods: {
    open(denom = undefined) {
      if (denom) {
        this.selectedTokens = [denom]
      } else {
        this.selectedTokens = [this.denoms[0]]
        this.amounts = [{ amount: 0, denom: this.denoms[0] }]
      }
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
    setMaxAmount(index) {
      this.amounts[index].amount = this.getMaxAmount(index)
    },
    isMaxAmount(index) {
      const selectedBalance = this.getSelectedBalance(this.denoms[index])
      if (selectedBalance.available === 0) {
        return false
      } else {
        return (
          parseFloat(this.amounts[index].amount) === this.getMaxAmount(index)
        )
      }
    },
    getMaxAmount(index) {
      const selectedBalance = this.getSelectedBalance(this.denoms[index])
      if (this.networkFeesLoaded) {
        return this.maxDecimals(
          selectedBalance.available - this.networkFees.transactionFee.amount,
          6
        )
      } else {
        return this.maxDecimals(selectedBalance.available, 6)
      }
    },
    token() {
      if (!this.selectedTokens) return ``

      return this.selectedTokens
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
      if (address.startsWith(this.network.address_prefix)) {
        return true
      } else {
        this.addressError = `Address prefix does not match this network's prefix`
        return false
      }
    },
    validatorAddressValidation(address) {
      if (address.includes('valoper')) {
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
    addAmount(index) {
      this.amounts.push({
        amount: 0,
        denom: this.denoms[this.amounts.length - 1],
      })
    },
  },
  validations(index) {
    return {
      address: {
        required,
        bech32Validation: this.bech32Validation,
        prefixValidation: this.prefixValidation,
        validatorAddressValidation: this.validatorAddressValidation,
      },
      amount: {
        required,
        decimal,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          return Number(x).toString().split('.').length > 1
            ? Number(x).toString().split('.')[1].length <= 6
            : true
        },
      },
      denoms: { required },
      selectedTokens: { required },
      memo: {
        maxLength: maxLength(this.max_memo_characters),
      },
    }
  },
}
</script>
<style scoped>
.tm-field-addon {
  border-right: 0;
}

.tm-field-addon:focus {
  border-color: var(--input-bc);
}

.tm-field-token-selector {
  width: 80px;
}

.tm-field-token-selector >>> .tm-field-select {
  border-left: 0;
  border-radius: 0 !important;
}

.tm-field-token-selector >>> .tm-field-select:focus {
  border-color: var(--input-bc);
}

.tm-field-token-selector >>> .tm-field-select-addon {
  border: 0;
}

.memo-span {
  font-size: var(--sm);
  font-style: italic;
}

.add-amount-button {
  text-align: right;
  color: var(--primary);
  cursor: pointer;
}
</style>
