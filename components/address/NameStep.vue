<template>
  <TmFormStruct :submit="onSubmit">
    <h2 class="session-title">Create a new address</h2>
    <div class="session-main bottom-indent">
      <DangerZoneWarning />

      <TmFormGroup
        :error="$v.fieldName.$error"
        field-id="sign-up-name"
        field-label="Account Name"
      >
        <TmField
          id="sign-up-name"
          v-model.trim="fieldName"
          v-focus
          type="text"
          placeholder="Must be at least 3 characters"
          vue-focus="vue-focus"
        />
        <TmFormMsg
          v-if="$v.fieldName.$error && !$v.fieldName.required"
          name="Name"
          type="required"
        />
        <TmFormMsg
          v-if="$v.fieldName.$error && !$v.fieldName.minLength"
          name="Name"
          type="minLength"
          min="3"
        />
        <TmFormMsg
          v-if="$v.fieldName.$error && !$v.fieldName.nameExists"
          name="Name"
          type="custom"
          msg="already exists"
        />
      </TmFormGroup>
    </div>
    <div class="session-footer">
      <TmBtn value="Next" type="submit" />
    </div>
  </TmFormStruct>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  name: `name-step`,
  props: {
    name: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    fieldName: undefined,
  }),
  mounted() {
    this.fieldName = this.name
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.$emit('submit', this.fieldName)
    },
    async nameExists(fieldName) {
      const { getWalletIndex } = await import('@lunie/cosmos-keys')
      const walletIndex = getWalletIndex()
      if (walletIndex.some((e) => e.name === fieldName)) {
        return false
      } else {
        return true
      }
    },
  },
  validations() {
    return {
      fieldName: {
        required,
        minLength: minLength(3),
        nameExists: this.nameExists,
      },
    }
  },
}
</script>
