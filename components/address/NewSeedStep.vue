<template>
  <Form :submit="onSubmit.bind(this)">
    <h2 class="session-title">Seed Phrase</h2>
    <div class="session-main bottom-indent reorder">
      <Seed :value="fieldSeed" />

      <FormGroup
        :error="$v.fieldWarning.$error"
        class="field-checkbox"
        field-id="sign-up-warning"
        field-label
      >
        <div class="field-checkbox-input">
          <label class="field-checkbox-label" for="sign-up-warning">
            <input
              id="sign-up-warning"
              v-model="fieldWarning"
              v-focus
              type="checkbox"
            />
            <span class="label"
              >I understand that I am solely responsible for the security of my
              seed phrase, that lost seed phrases cannot be recovered, and that
              there is inherent risk associated with non-custodial wallets and
              managing my own keys.</span
            ></label
          >
        </div>
        <FormMessage
          v-if="$v.fieldWarning.$error && !$v.fieldWarning.required"
          name="Recovery confirmation"
          type="required"
        />
      </FormGroup>
    </div>
    <div class="session-footer">
      <Button value="Next" type="submit" />
    </div>
  </Form>
</template>

<script>
import { sameAs } from 'vuelidate/lib/validators'

export default {
  name: `NewSeedStep`,
  props: {
    seed: {
      type: String,
      default: () => undefined,
    },
  },
  data: () => ({
    fieldSeed: undefined,
    fieldWarning: false,
  }),
  mounted() {
    this.getSeed()
  },
  methods: {
    async getSeed() {
      if (!this.seed) {
        const { Secp256k1HdWallet } = await import('@cosmjs/launchpad')
        this.fieldSeed = (await Secp256k1HdWallet.generate(24)).mnemonic
      } else {
        this.fieldSeed = this.seed
      }
    },
    onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$emit('submit', this.fieldSeed)
    },
  },
  validations: () => ({
    fieldWarning: { required: sameAs(() => true) },
  }),
}
</script>
<style scoped>
label {
  display: flex;
}

input {
  margin-top: 3px;
}

.label {
  padding-left: 0.5rem;
  font-size: var(--text-xs);
  line-height: var(--text-sm);
}
</style>
