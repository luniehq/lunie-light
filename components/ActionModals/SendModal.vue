<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Send"
    submission-error-prefix="Sending tokens failed"
    :transaction-type="lunieMessageTypes.SEND"
    :transaction-data="transactionData"
    :selected-denom="selectedToken"
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
        v-else-if="$v.address.$error && !$v.address.bech32Validation"
        name="Address"
        type="custom"
        msg="is invalid"
      />
      <TmFormMsg
        v-else-if="$v.address.$error && !$v.address.prefixValidation"
        name="Address"
        type="custom"
        msg="is not valid for this network"
      />
    </TmFormGroup>
    <TmFormGroup
      id="form-group-amount"
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <TmFieldGroup>
        <TmField
          id="amount"
          ref="amount"
          v-model="amount"
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmField
          id="token"
          v-model="selectedToken"
          :title="`Select the token you wish to operate with`"
          :options="getDenoms"
          class="tm-field-token-selector"
          placeholder="Select the token"
          type="select"
        />
        <TmBtn
          type="button"
          class="addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
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
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${selectedToken} to proceed.`"
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
        v-else-if="isMaxAmount()"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc max-message"
      />
    </TmFormGroup>
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
import { startsWith } from 'lodash'
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
    amount: null,
    memo: defaultMemo,
    max_memo_characters: 256,
    isFirstLoad: true,
    selectedToken: undefined,
    balances: [],
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    networkFeesLoaded: false,
    network,
  }),
  computed: {
    ...mapState([`session`]),
    selectedBalance() {
      return (
        this.balances.find(({ denom }) => denom === this.selectedToken) || {
          amount: 0,
        }
      )
    },
    transactionData() {
      if (isNaN(this.amount) || !this.session || !this.selectedToken) {
        return {}
      }
      return {
        type: lunieMessageTypes.SEND,
        to: [this.address],
        from: [this.session.address],
        amount: {
          amount: this.amount,
          denom: this.selectedToken,
        },
        memo: this.memo,
      }
    },
    notifyMessage() {
      return {
        title: `Successful Send`,
        body: `Successfully sent ${this.amount} ${
          this.selectedToken
        }s to ${formatAddress(this.address)}`,
      }
    },
    getDenoms() {
      return this.denoms
        ? this.denoms.map((denom) => (denom = { key: denom, value: denom }))
        : []
    },
    // TODO: maxAmount should be handled from ActionModal
    maxAmount() {
      if (this.networkFeesLoaded) {
        return this.maxDecimals(
          this.selectedBalance.amount - this.networkFees.transactionFee.amount,
          6
        )
      } else {
        return this.maxDecimals(this.selectedBalance.amount, 6)
      }
    },
  },
  watch: {
    // we set the amount in the input to zero every time the user selects another token so they
    // realize they are dealing with a different balance each time
    selectedToken() {
      if (!this.isFirstLoad) {
        this.amount = 0
      } else {
        this.isFirstLoad = false
      }
    },
    balances(balances) {
      // if there is already a token selected don't reset it
      if (this.selectedToken) return

      // in case the account has no balances we will display the staking denom received from the denom query
      if (balances.length === 0) {
        this.selectedToken = network.stakingDenom
      } else {
        this.selectedToken = balances[0].denom
      }
    },
  },
  methods: {
    open(denom = undefined) {
      if (denom) {
        this.selectedToken = denom
      } else {
        this.selectedToken =
          this.balances && this.balances.length > 0
            ? this.balances[0].denom
            : network.stakingDenom
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
      this.amount = undefined
      this.memo = defaultMemo
      this.sending = false
    },
    setMaxAmount() {
      this.amount = this.maxAmount
    },
    isMaxAmount() {
      if (this.selectedBalance.amount === 0) {
        return false
      } else {
        return parseFloat(this.amount) === this.maxAmount
      }
    },
    token() {
      if (!this.selectedToken) return ``

      return this.selectedToken
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
  },
  validations() {
    return {
      address: {
        required,
        bech32Validation: this.bech32Validation,
        prefixValidation: this.prefixValidation,
      },
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
      denoms: { required },
      selectedToken: { required },
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
</style>
