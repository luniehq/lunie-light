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
          :steps="steps"
          :active-step="step"
        />
      </div>
      <div v-if="requiresSignIn" class="action-modal-form">
        <p class="form-message notice">
          You're in explore mode. Sign in or create an account to get started.
        </p>
      </div>
      <div v-else-if="step === defaultStep" class="action-modal-form">
        <slot />
      </div>
      <div v-else-if="step === feeStep" class="action-modal-form">
        <TableInvoice
          v-model="feeDenom"
          :amounts="amounts"
          :fees="networkFees.feeOptions"
        />
        <FormMessage
          v-if="$v.invoiceTotal.$error && $v.invoiceTotal.$invalid"
          type="custom"
          :msg="`Your balance is not enough to proceed.`"
        />
      </div>
      <div v-else-if="step === signStep" class="action-modal-form">
        <form
          v-if="session.sessionType === SESSION_TYPES.LOCAL"
          @submit.prevent="validateChangeStep"
        >
          <FormGroup
            class="action-modal-group"
            field-id="password"
            field-label="Password"
          >
            <Field
              id="password"
              v-model="password"
              v-focus
              type="password"
              placeholder="Password"
            />
            <FormMessage
              v-if="$v.password.$error && $v.password.$invalid"
              name="Password"
              type="required"
            />
          </FormGroup>
        </form>
        <div v-else-if="session.sessionType === SESSION_TYPES.KEPLR">
          The transaction will be send to the Keplr Browser Extension for
          signing.
        </div>
        <div v-else-if="session.sessionType === SESSION_TYPES.EXTENSION">
          The transaction will be send to the Lunie Browser Extension for
          signing.
        </div>
        <div v-else-if="session.sessionType === SESSION_TYPES.LEDGER">
          The transaction will be sent to the Ledger Nano for signing.
        </div>
      </div>
      <div v-else-if="step === inclusionStep" class="action-modal-form">
        <Card icon="hourglass_empty" :spin="true">
          <div slot="title">Sent and confirming</div>
          <div slot="subtitle">
            Waiting for confirmation from {{ network.name }}.
          </div>
        </Card>
      </div>
      <div
        v-else-if="step === successStep"
        class="action-modal-form success-step"
      >
        <Card icon="check" icon-color="var(--success)" :success="true">
          <div slot="title">{{ notifyMessage.title }}</div>
          <div slot="subtitle">
            {{ notifyMessage.body }}
            <br />
            <br />
            <router-link to="/transactions">See your transaction</router-link>
          </div>
        </Card>
      </div>
      <Card
        v-if="submissionError"
        class="form-msg sm form-msg--error submission-error"
      >
        <div slot="title">{{ submissionErrorPrefix }}</div>
        <div slot="subtitle">{{ submissionError }}</div>
      </Card>
      <div class="action-modal-footer">
        <slot name="action-modal-footer">
          <div
            v-if="[defaultStep, feeStep, signStep].includes(step)"
            class="action-modal-group"
          >
            <Button
              id="closeBtn"
              value="Cancel"
              type="secondary"
              @click.native="close"
            />
            <Button
              v-if="requiresSignIn"
              v-focus
              value="Sign In"
              type="primary"
              @click.native="goToSession"
              @click.enter.native="goToSession"
            />
            <Button
              v-else-if="sending"
              value="Sending..."
              disabled="disabled"
              type="primary"
            />
            <Button
              v-else-if="step !== signStep"
              ref="next"
              type="primary"
              value="Next"
              :loading="!balancesLoaded"
              :disabled="disabled || !balancesLoaded"
              @click.native="validateChangeStep"
            />
            <Button
              v-else
              type="primary"
              value="Send"
              @click.native="validateChangeStep"
            />
          </div>
        </slot>
      </div>
    </div>
  </transition>
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapState } from 'vuex'
import { requiredIf } from 'vuelidate/lib/validators'
import { prettyInt, SMALLEST } from '~/common/numbers'
import network from '~/common/network'
import fees from '~/common/fees'
import { pollTxInclusion } from '~/signing/transaction-manager'

const defaultStep = `details`
const feeStep = `fees`
const signStep = `sign`
const inclusionStep = `send`
const successStep = `success`

const SESSION_TYPES = {
  LOCAL: `local`,
  LEDGER: `ledger`,
  EXTENSION: `extension`,
  KEPLR: `keplr`,
  EXPLORE: `explore`,
}

export default {
  name: `ActionModal`,
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
    amounts: {
      type: Array,
      default: () => [],
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
      type: Array,
      default: () => [],
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
    txHash: null,
    defaultStep,
    feeStep,
    signStep,
    inclusionStep,
    successStep,
    SESSION_TYPES,
    includedHeight: undefined,
    smallestAmount: SMALLEST,
    network,
    feeDenom: network.stakingDenom,
  }),
  computed: {
    ...mapState(['session', 'currrentModalOpen']),
    ...mapState('data', ['balances', 'balancesLoaded']),
    ...mapState('ledger', ['transport']),
    networkFees() {
      return fees.getFees(this.transactionData.type)
    },
    requiresSignIn() {
      return !this.session || this.session.sessionType === SESSION_TYPES.EXPLORE
    },
    steps() {
      const isExtensionSession =
        this.session.sessionType === SESSION_TYPES.KEPLR
      return [
        'Details',
        isExtensionSession ? undefined : 'Fees',
        'Sign',
      ].filter((x) => !!x)
    },
    isValidChildForm() {
      // here we trigger the validation of the child form
      if (this.validate) {
        return this.validate()
      }
      return true
    },
  },
  watch: {
    networkFees(fees) {
      // set the fee denom to a default in the beginning
      this.feeDenom = fees.feeOptions[0].denom
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
  validations() {
    return {
      password: {
        required: requiredIf(
          () =>
            this.session.sessionType === SESSION_TYPES.LOCAL &&
            this.step === signStep
        ),
      },
      invoiceTotal: {
        available: () =>
          this.amounts
            .concat(
              this.networkFees.feeOptions.find(
                ({ denom }) => denom === this.feeDenom
              )
            )
            .every(({ amount, denom }) => {
              const balance = this.balances.find(
                (balance) => balance.denom === denom
              )
              return !!balance && Number(balance.available) >= Number(amount)
            }),
      },
    }
  },
  methods: {
    open() {
      this.show = true
    },
    close() {
      this.submissionError = null
      this.password = null
      this.step = defaultStep
      this.show = false
      this.sending = false
      this.includedHeight = undefined

      this.$emit(`close`)
    },
    goToSession() {
      this.close()

      this.$router.push('/welcome')
    },
    isValidInput(property) {
      this.$v[property].$touch()

      return !this.$v[property].$invalid
    },
    previousStep() {
      switch (this.step) {
        case signStep:
          // Keplr is handling fees
          this.step =
            this.session.sessionType === SESSION_TYPES.KEPLR
              ? defaultStep
              : feeStep
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
          // Keplr is handling fees
          this.step =
            this.session.sessionType === SESSION_TYPES.KEPLR
              ? signStep
              : feeStep
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
        // Lazy import as a bunch of big libraries are imported here
        const { createSignBroadcast } = await import(
          '~/signing/transaction-manager'
        )

        // TODO currently not respected
        const HDPath = network.HDPath

        const block = await this.$store.dispatch('data/getBlock')
        const accountInfo = await this.$store.dispatch(
          'data/getAccountInfo',
          this.session.address
        )

        const hashResult = await createSignBroadcast({
          messageType: type,
          message,
          senderAddress: this.session.address,
          accountInfo,
          network,
          signingType: this.session.sessionType,
          password: this.password,
          HDPath,
          memo,
          feeDenom: this.feeDenom,
          chainId: block.chainId,
          ledgerTransport: this.transport,
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

      // after we do any successful tx refresh the data as balances etc could have been updated
      this.refreshData()
    },
    onSendingFailed(error) {
      this.step = signStep
      this.submissionError = `${this.submissionErrorPrefix}: ${error.message}.`
    },
    maxDecimals(value, decimals) {
      return Number(BigNumber(value).toFixed(decimals)) // TODO only use bignumber
    },
    async pollTxInclusion(hash) {
      try {
        await pollTxInclusion(hash)
        this.onTxIncluded()
      } catch (err) {
        this.onSendingFailed(err)
      }
    },
    refreshData() {
      this.$store.dispatch('data/refresh')
    },
  },
}
</script>

<style scoped>
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
  font-size: var(--text-2xl);
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
  font-size: var(--text-xl);
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

.action-modal-form .form-group {
  display: block;
  padding: 1rem 0;
}

.action-modal-footer {
  padding: 1.5rem 0 1rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.action-modal-footer button:first-child {
  margin-right: 0.25rem;
}

.form-group__field {
  position: relative;
}

.action-modal-footer .form-group .form-group__field button {
  width: 100%;
}

.action-modal-footer .form-group .form-group__field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.action-modal-footer .form-group .form-group__field .secondary {
  margin-right: 0.5rem;
}

.action-modal-footer .form-group {
  padding: 0;
}

.submission-error {
  padding: 1rem;
}

.form-message {
  font-size: var(--text-xs);
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
#send-modal .data-msg {
  margin: 2rem 0 2rem 0;
}

@media screen and (max-width: 576px) {
  .data-msg__icon {
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

  .form-group__field {
    width: 100%;
  }
}
</style>
