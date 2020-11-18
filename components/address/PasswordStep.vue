<template>
  <Form :submit="onSubmit">
    <h2 class="session-title">Choose a password</h2>
    <div>
      <FormGroup
        :error="$v.fieldPassword.$error"
        field-id="sign-up-password"
        field-label="Password"
      >
        <Field
          id="sign-up-password"
          v-model="fieldPassword"
          v-focus
          type="password"
          placeholder="Must be at least 10 characters"
        />
        <FormMessage
          v-if="$v.fieldPassword.$error && !$v.fieldPassword.required"
          name="Password"
          type="required"
        />
        <FormMessage
          v-if="$v.fieldPassword.$error && !$v.fieldPassword.minLength"
          name="Password"
          type="minLength"
          min="10"
        />
      </FormGroup>
      <FormGroup
        :error="$v.fieldPasswordConfirm.$error"
        field-id="sign-up-password-confirm"
        field-label="Confirm Password"
      >
        <Field
          id="sign-up-password-confirm"
          v-model="fieldPasswordConfirm"
          type="password"
          placeholder="Enter password again"
        />
        <FormMessage
          v-if="
            $v.fieldPasswordConfirm.$error &&
            !$v.fieldPasswordConfirm.sameAsPassword
          "
          name="Password confirmation"
          type="match"
        />
      </FormGroup>
      <div class="session-footer">
        <Button value="Next" type="submit" />
      </div>
    </div>
  </Form>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  name: `PasswordStep`,
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
