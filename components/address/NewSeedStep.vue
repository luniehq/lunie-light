<template>
  <TmFormStruct :submit="onSubmit.bind(this)">
    <h2 class="session-title">Backup code</h2>
    <div class="session-main bottom-indent reorder">
      <Seed :value="fieldSeed" />

      <TmFormGroup
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
            I understand that lost seeds cannot be recovered.</label
          >
        </div>
        <TmFormMsg
          v-if="$v.fieldWarning.$error && !$v.fieldWarning.required"
          name="Recovery confirmation"
          type="required"
        />
      </TmFormGroup>
    </div>
    <div class="session-footer">
      <TmBtn :loading="loading" value="Create" />
    </div>
  </TmFormStruct>
</template>

<script>
import { sameAs } from 'vuelidate/lib/validators'

export default {
  name: `new-seed-step`,
  props: {
    seed: {
      type: String,
      default: () => undefined,
    },
    loading: {
      type: Boolean,
      default: () => false,
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
        const { getSeed } = await import('@lunie/cosmos-keys')
        this.fieldSeed = getSeed()
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
