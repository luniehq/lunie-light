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
      <!-- <TmFormMsg
        name="Address"
        type="required"
      />
      <TmFormMsg
        name="Address"
        type="custom"
        msg="doesn't have a format known by Lunie"
      /> -->
    </TmFormGroup>
    <TmFormGroup
      id="form-group-amount"
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
      <!-- <TmFormMsg
        v-if="selectedBalance.amount === 0"
        :msg="`doesn't have any ${selectedToken}s`"
        name="Wallet"
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
        :msg="`You don't have enough ${selectedToken}s to proceed.`"
      />
      <TmFormMsg
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <TmFormMsg
        name="Amount"
        type="maxDecimals"
      />
      <TmFormMsg
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc max-message"
      /> -->
    </TmFormGroup>
    <TmFormGroup
      id="memo"
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
      <span class="memo-span"
        >To learn more about how to use the memo field, read
        <a
          href=" https://intercom.help/lunie/en/articles/3776563-using-the-memo-option-when-sending-tokens-to-and-from-exchanges"
          rel="noopener norefferer"
          target="_blank"
          >our guide</a
        >.</span
      >
      <!-- <TmFormMsg
        name="Memo"
        type="maxLength"
        :max="max_memo_characters"
      /> -->
    </TmFormGroup>
  </ActionModal>
</template>

<script>
// import { required, decimal, maxLength } from 'vuelidate/lib/validators'
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
  }),
  computed: {
    ...mapState([`session`]),
    ...mapState([`balances`]),
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
          this.selectedBalance.available -
            this.networkFees.transactionFee.amount,
          6
        )
      } else {
        return this.maxDecimals(this.selectedBalance.available, 6)
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
      // this.$v.$touch()
      // return !this.$v.$invalid
      return true
    },
    clear() {
      // this.$v.$reset()

      this.address = undefined
      this.amount = undefined
      this.memo = defaultMemo
      this.sending = false
    },
    setMaxAmount() {
      this.amount = this.maxAmount
    },
    isMaxAmount() {
      if (this.selectedBalance.available === 0) {
        return false
      } else {
        return parseFloat(this.amount) === this.maxAmount
      }
    },
    token() {
      if (!this.selectedToken) return ``

      return this.selectedToken
    },
    bech32Validate(param) {
      try {
        decodeB32(param)
        return true
      } catch (error) {
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
  // validations() {
  //   return {
  //     address: {
  //       required,
  //       validAddress: (address) =>
  //         this.bech32Validate(address) || isPolkadotAddress(address),
  //     },
  //     amount: {
  //       required: (x) => !!x && x !== `0`,
  //       decimal,
  //       max: (x) => Number(x) <= this.maxAmount,
  //       min: (x) => Number(x) >= SMALLEST,
  //       maxDecimals: (x) => {
  //         return x.toString().split('.').length > 1
  //           ? x.toString().split('.')[1].length <= 6
  //           : true
  //       },
  //     },
  //     denoms: { required },
  //     selectedToken: { required },
  //     memo: {
  //       maxLength: maxLength(this.max_memo_characters),
  //     },
  //   }
  // },
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
