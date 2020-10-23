<template>
  <transition v-if="show" name="slide-fade">
    <div v-focus-last class="action-modal" tabindex="0" @keyup.esc="close">
      <div
        v-if="(step === feeStep || step === signStep) && !sending"
        id="prevBtn"
        class="action-modal-icon action-modal-prev"
        @click="previousStep"
      >
        <i class="material-icons notranslate">arrow_back</i>
      </div>
      <div class="action-modal-header">
        <div
          id="closeBtn"
          class="action-modal-icon action-modal-close"
          @click="close"
        >
          <i class="material-icons notranslate">close</i>
        </div>
        <span class="action-modal-title">{{ title }}</span>
        <Steps
          v-if="[defaultStep, feeStep, signStep].includes(step)"
          :steps="['Details', 'Fees', 'Sign']"
          :active-step="step"
        />
      </div>
      <div v-if="requiresSignIn" class="action-modal-form">
        <p class="form-message notice">
          You're using Lunie in explore mode. Sign in or create an account to
          get started.
        </p>
      </div>
      <div v-else-if="step === defaultStep" class="action-modal-form">
        <slot />
      </div>
      <div v-else-if="step === feeStep" class="action-modal-form">
        <TableInvoice
          :amount="Number(subTotal)"
          :fee="networkFee.fee"
          :transaction-denom="getDenom"
        />
        <!-- <TmFormMsg
            type="custom"
            :msg="`You don't have enough ${selectedDenom}s to proceed.`"
          /> -->
      </div>
      <div v-else-if="step === signStep" class="action-modal-form">
        <form
          v-if="selectedSignMethod === SIGN_METHODS.LOCAL"
          @submit.prevent="validateChangeStep"
        >
          <TmFormGroup
            class="action-modal-group"
            field-id="password"
            field-label="Password"
          >
            <TmField
              id="password"
              v-model="password"
              v-focus
              type="password"
              placeholder="Password"
            />
            <!-- <TmFormMsg
                name="Password"
                type="required"
              /> -->
          </TmFormGroup>
        </form>
      </div>
      <div v-else-if="step === inclusionStep" class="action-modal-form">
        <TmDataMsg icon="hourglass_empty" :spin="true">
          <div slot="title">Sent and confirming</div>
          <div slot="subtitle">
            Waiting for confirmation from {{ network.name }}.
          </div>
        </TmDataMsg>
      </div>
      <div
        v-else-if="step === successStep"
        class="action-modal-form success-step"
      >
        <TmDataMsg icon="check" icon-color="var(--success)" :success="true">
          <div slot="title">{{ notifyMessage.title }}</div>
          <div slot="subtitle">
            {{ notifyMessage.body }}
            <br />
            <br />
            <router-link to="/transactions">See your transaction</router-link>
          </div>
        </TmDataMsg>
      </div>
      <p
        v-if="submissionError"
        class="tm-form-msg sm tm-form-msg--error submission-error"
      >
        {{ submissionError }}
      </p>
      <div class="action-modal-footer">
        <slot name="action-modal-footer">
          <TmFormGroup
            v-if="[defaultStep, feeStep, signStep].includes(step)"
            class="action-modal-group"
          >
            <TmBtn
              id="closeBtn"
              value="Cancel"
              type="secondary"
              @click.native="close"
            />
            <TmBtn
              v-if="requiresSignIn"
              v-focus
              value="Sign In"
              type="primary"
              @click.native="goToSession"
              @click.enter.native="goToSession"
            />
            <TmBtn
              v-else-if="sending"
              value="Sending..."
              disabled="disabled"
              type="primary"
            />
            <TmBtn
              v-else-if="step !== signStep"
              ref="next"
              type="primary"
              value="Next"
              :loading="!balancesLoaded"
              :disabled="disabled || !balancesLoaded"
              @click.native="validateChangeStep"
            />
            <TmBtn
              v-else
              type="primary"
              value="Send"
              @click.native="validateChangeStep"
            />
          </TmFormGroup>
        </slot>
      </div>
    </div>
  </transition>
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapState } from 'vuex'
// import { requiredIf } from 'vuelidate/lib/validators'
import { prettyInt, SMALLEST } from '~/common/numbers'
import network from '~/network'
import fees from '~/fees'
import CosmosV2Source from '~/common/cosmosV2-source'

const defaultStep = `details`
const feeStep = `fees`
const signStep = `sign`
const inclusionStep = `send`
const successStep = `success`

const SIGN_METHODS = {
  LOCAL: `local`,
  // LEDGER: `ledger`,
  // EXTENSION: `extension`,
}

const sessionType = {
  EXPLORE: 'explore',
  LOCAL: SIGN_METHODS.LOCAL,
  // LEDGER: SIGN_METHODS.LEDGER,
  // EXTENSION: SIGN_METHODS.EXTENSION,
}

export default {
  name: `action-modal`,
  filters: {
    prettyInt,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    validate: {
      type: Function,
      default: undefined,
    },
    submissionErrorPrefix: {
      type: String,
      default: `Transaction failed`,
    },
    amount: {
      type: [String, Number],
      default: `0`,
    },
    rewards: {
      type: Array,
      default: () => [],
    },
    transactionData: {
      type: Object,
      default: () => {},
    },
    notifyMessage: {
      type: Object,
      default: () => ({
        title: `Successful transaction`,
        body: `You have successfully completed a transaction.`,
      }),
    },
    // disable proceeding from the first page
    disabled: {
      type: Boolean,
      default: false,
    },
    selectedDenom: {
      type: String,
      default: ``,
    },
    transactionType: {
      type: String,
      default: 'UnknownTx',
    },
  },
  data: () => ({
    step: defaultStep,
    password: null,
    sending: false,
    submissionError: null,
    show: false,
    loaded: false,
    txHash: null,
    defaultStep,
    feeStep,
    signStep,
    inclusionStep,
    successStep,
    SIGN_METHODS,
    includedHeight: undefined,
    smallestAmount: SMALLEST,
    balances: [],
    balancesLoaded: false,
    network,
  }),
  computed: {
    ...mapState(['session', 'currrentModalOpen']),
    networkFee() {
      return fees[this.transactionData.type]
    },
    selectedSignMethod() {
      return sessionType.LOCAL
    },
    requiresSignIn() {
      return false // !this.session || this.session.type === sessionType.EXPLORE
    },
    subTotal() {
      return this.transactionType === 'UnstakeTx' ? 0 : this.amount
    },
    invoiceTotal() {
      return (
        Number(this.subTotal) +
        Number(fees[this.transactionData.type].fee.amount)
      )
    },
    isValidChildForm() {
      // here we trigger the validation of the child form
      if (this.validate) {
        return this.validate()
      }
      return true
    },
    getDenom() {
      return this.selectedDenom || network.stakingDenom
    },
    selectedBalance() {
      const defaultBalance = {
        amount: 0,
      }
      if (this.balances.length === 0 || !network) {
        return defaultBalance
      }
      // default to the staking denom for fees
      const feeDenom = this.selectedDenom || network.stakingDenom
      let balance = this.balances.find(({ denom }) => denom === feeDenom)
      if (!balance) {
        balance = defaultBalance
      }
      return balance
    },
  },
  updated() {
    if (
      (this.title === 'Withdraw' || this.step === 'fees') &&
      this.$refs.next
    ) {
      this.$refs.next.$el.focus()
    }
  },
  // validations() {
  //   return {
  //     password: {
  //       required: requiredIf(
  //         () =>
  //           this.selectedSignMethod === SIGN_METHODS.LOCAL &&
  //           this.step === signStep
  //       ),
  //     },
  //     invoiceTotal: {
  //       max: (x) =>
  //         networkFeesLoaded &&
  //         networkFees.transactionFee.denom !== this.selectedDenom
  //           ? true
  //           : Number(x) <= this.selectedBalance.amount,
  //     },
  //   }
  // },
  mounted() {
    this.loadData()
  },
  methods: {
    confirmModalOpen() {
      let confirmResult = false
      if (this.currrentModalOpen) {
        confirmResult = window.confirm(
          'You are in the middle of creating a transaction. Are you sure you want to cancel this action and start a new one?'
        )
        if (confirmResult) {
          this.currrentModalOpen.close()
          this.$store.commit(`setCurrrentModalOpen`, false)
        }
      }
    },
    open() {
      // TODO creates weird loop
      // this.confirmModalOpen()
      // if (this.currrentModalOpen) {
      //   return
      // }
      // this.$store.commit(`setCurrrentModalOpen`, this)
      this.show = true
    },
    close() {
      this.$store.commit(`setCurrrentModalOpen`, false)
      this.submissionError = null
      this.password = null
      this.step = defaultStep
      this.show = false
      this.sending = false
      this.includedHeight = undefined

      // reset form
      // in some cases $v is not yet set
      // if (this.$v) {
      //   this.$v.$reset()
      // }
      this.$emit(`close`)
    },
    goToSession() {
      this.close()

      this.$router.push('/address')
    },
    isValidInput(property) {
      //   this.$v[property].$touch()

      //   return !this.$v[property].$invalid
      return true
    },
    previousStep() {
      switch (this.step) {
        case signStep:
          this.step = feeStep
          break
        case feeStep:
          this.step = defaultStep
          break
      }
    },
    async validateChangeStep() {
      if (this.disabled) return

      // An ActionModal is only the prototype of a parent modal
      switch (this.step) {
        case defaultStep:
          if (!this.isValidChildForm) {
            return
          }
          this.step = feeStep
          return
        case feeStep:
          if (!this.isValidInput(`invoiceTotal`)) {
            return
          }
          this.step = signStep
          return
        case signStep:
          if (!this.isValidInput(`password`)) {
            return
          }
          // submit transaction
          this.sending = true
          await this.submit()
          this.sending = false
          break
        default:
      }
    },
    async submit() {
      this.submissionError = null

      // TODO is this check really needed?
      if (
        Object.entries(this.transactionData).length === 0 &&
        this.transactionData.constructor === Object
      ) {
        this.onSendingFailed(new Error(`Error in transaction data`))
        return
      }

      const { type, memo, ...message } = this.transactionData

      try {
        if (!this.transactionManager) {
          // Lazy import as a bunch of big libraries are imported here
          const { default: TransactionManager } = await import(
            '~/signing/transaction-manager'
          )
          const _store = {}
          const api = new CosmosV2Source(
            this.$axios,
            network,
            _store,
            null,
            null
          )
          this.transactionManager = new TransactionManager(api)
        }

        const transactionData = await this.transactionManager.getTransactionMetaData(
          type,
          memo,
          this.session.address
        )
        debugger
        // TODO currently not respected
        const HDPath = network.HDPath
        const curve = network.curve

        const hashResult = await this.transactionManager.createSignBroadcast({
          messageType: type,
          message,
          transactionData,
          senderAddress: this.session.address,
          network,
          signingType: this.selectedSignMethod,
          password: this.password,
          HDPath,
          curve,
        })

        const { hash } = hashResult
        this.txHash = hash
        this.step = inclusionStep

        this.pollTxInclusion(hash)
      } catch (error) {
        this.onSendingFailed(error)
      }
    },
    onTxIncluded() {
      this.step = successStep
      this.$emit(`txIncluded`)
    },
    onSendingFailed(error) {
      this.step = signStep
      this.submissionError = `${this.submissionErrorPrefix}: ${error.message}.`
    },
    maxDecimals(value, decimals) {
      return Number(BigNumber(value).toFixed(decimals)) // TODO only use bignumber
    },
    async loadData(api) {
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
        this.balances = balances
        this.balancesLoaded = true
      }
    },
    async pollTxInclusion(hash, iteration = 0) {
      const MAX_POLL_ITERATIONS = 30
      let txFound = false
      try {
        await fetch(`${network.api_url}/txs/${hash}`).then((res) => {
          if (res.status === 200) {
            txFound = true
          }
        })
      } catch (err) {
        // ignore error
      }
      if (txFound) {
        this.onTxIncluded()
      } else if (iteration < MAX_POLL_ITERATIONS) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        this.pollTxInclusion(hash, iteration + 1)
      } else {
        this.onSendingFailed(
          new Error(
            `The transaction wasn't included in time. Check explorers for the transaction hash ${hash}.`
          )
        )
      }
    },
  },
}
</script>

<style>
.action-modal {
  background: var(--app-fg);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  right: 1rem;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 500px;
  min-height: 400px;
  z-index: var(--z-modal);
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  border-left: 2px solid var(--bc-dim);
  border-right: 2px solid var(--bc-dim);
  border-top: 2px solid var(--bc-dim);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  outline: none;
}

.action-modal-header {
  align-items: center;
  flex-direction: column;
  text-align: center;
  display: flex;
}

.action-modal-title {
  flex: 1;
  font-size: var(--h2);
  font-weight: 400;
  color: var(--bright);
  padding-bottom: 1rem;
}

.action-modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-modal-icon i {
  font-size: var(--lg);
}

.action-modal-icon.action-modal-prev {
  cursor: pointer;
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.action-modal-icon.action-modal-close {
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.action-modal-icon.action-modal-close:hover i {
  color: var(--link);
}

.action-modal-form .tm-form-group {
  display: block;
  padding: 1rem 0;
}

.action-modal-footer {
  padding: 1.5rem 0 1rem;
  width: 100%;
}

.tm-form-group__field {
  position: relative;
}

.action-modal-footer .tm-form-group .tm-form-group__field button {
  width: 100%;
}

.action-modal-footer .tm-form-group .tm-form-group__field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.action-modal-footer .tm-form-group .tm-form-group__field .secondary {
  margin-right: 0.5rem;
}

.action-modal-footer .tm-form-group {
  padding: 0;
}

.submission-error {
  padding: 1rem;
}

.form-message {
  font-size: var(--sm);
  color: var(--bright);
  font-style: italic;
  display: inline-block;
}

.slide-fade-enter-active {
  transition: all 0.1s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(2rem);
  opacity: 0;
}
/* stylelint-disable */
#send-modal .tm-data-msg {
  margin: 2rem 0 2rem 0;
}

@media screen and (max-width: 576px) {
  .tm-data-msg__icon {
    margin-right: 0;
  }
}

@media screen and (max-width: 667px) {
  .row {
    flex-direction: column;
  }

  .action-modal {
    right: 0;
    top: 0;
    overflow-x: scroll;
    padding-top: 3rem;
    border: 0;
    border-radius: 0;
  }

  .action-modal-footer button {
    width: 100%;
  }

  .tm-form-group__field {
    width: 100%;
  }
}

/* iPhone X and Xs Max */
@media only screen and (min-device-width: 375px) and (min-device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait) {
  .action-modal-footer {
    padding-bottom: 1.8rem;
  }
}

/* iPhone XR */
@media only screen and (min-device-width: 414px) and (min-device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait) {
  .action-modal-footer {
    padding-bottom: 1.8rem;
  }
}
</style>
