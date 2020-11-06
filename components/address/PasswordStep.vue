<template>
  <TmFormStruct :submit="onSubmit">
    <h2 class="session-title">Choose a password</h2>
    <div>
      <TmFormGroup
        :error="$v.fieldPassword.$error"
        field-id="sign-up-password"
        field-label="Password"
      >
        <TmField
          id="sign-up-password"
          v-model="fieldPassword"
          v-focus
          type="password"
          placeholder="Must be at least 10 characters"
        />
        <TmFormMsg
          v-if="$v.fieldPassword.$error && !$v.fieldPassword.required"
          name="Password"
          type="required"
        />
        <TmFormMsg
          v-if="$v.fieldPassword.$error && !$v.fieldPassword.minLength"
          name="Password"
          type="minLength"
          min="10"
        />
      </TmFormGroup>
      <TmFormGroup
        :error="$v.fieldPasswordConfirm.$error"
        field-id="sign-up-password-confirm"
        field-label="Confirm Password"
      >
        <TmField
          id="sign-up-password-confirm"
          v-model="fieldPasswordConfirm"
          type="password"
          placeholder="Enter password again"
        />
        <TmFormMsg
          v-if="
            $v.fieldPasswordConfirm.$error &&
            !$v.fieldPasswordConfirm.sameAsPassword
          "
          name="Password confirmation"
          type="match"
        />
      </TmFormGroup>
      <div class="session-footer">
        <Button value="Next" type="submit" />
      </div>
    </div>
  </TmFormStruct>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  name: `password-step`,
  props: {
    password: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    fieldPassword: undefined,
    fieldPasswordConfirm: undefined,
  }),
  mounted() {
    this.fieldPassword = this.password
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$emit('submit', this.fieldPassword)
    },
  },
  validations: () => ({
    fieldPassword: { required, minLength: minLength(10) },
    fieldPasswordConfirm: { sameAsPassword: sameAs(`fieldPassword`) },
  }),
}
</script>
