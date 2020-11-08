<template>
  <SessionFrame :icon="`lock`">
    <Form :submit="onSubmit" class="session-container">
      <h2 class="session-title">Sign in with account</h2>
      <div class="session-main bottom-indent">
        <FormGroup field-id="sign-in-name" field-label="Select Account">
          <Field
            id="sign-in-name"
            v-model="signInAddress"
            :options="accounts"
            type="select"
            placeholder="Select account…"
            vue-focus="vue-focus"
          />
          <FormMessage
            v-if="$v.signInAddress.$error && !$v.signInAddress.required"
            name="Name"
            type="required"
          />
        </FormGroup>

        <FormGroup
          :error="$v.signInPassword.$error"
          field-id="sign-in-password"
          field-label="Password"
        >
          <Field
            id="sign-in-password"
            v-model="signInPassword"
            type="password"
          />
          <FormMessage
            v-if="$v.signInPassword.$error && !$v.signInPassword.required"
            name="Password"
            type="required"
          />
          <FormMessage
            v-if="$v.signInPassword.$error && !$v.signInPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
          <FormMessage v-if="error" type="custom" :msg="error" />
        </FormGroup>
      </div>
      <div class="session-footer">
        <Button value="Sign In" :disabled="loading" />
      </div>
    </Form>
  </SessionFrame>
</template>

<script>
import { getWalletIndex, testPassword } from '@lunie/cosmos-keys'
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  name: `sign-in`,
  data: () => ({
    signInAddress: undefined,
    signInPassword: ``,
    error: ``,
    loading: false,
  }),
  computed: {
    accounts() {
      if (process.client) {
        const accounts = getWalletIndex()
        return accounts.map(({ name, address }) => ({
          value: address,
          key: name,
        }))
      }
      return []
    },
  },
  middleware: 'localSigning',
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.loading = true

      try {
        testPassword(this.signInAddress, this.signInPassword)
        this.$store.dispatch('signIn', {
          address: this.signInAddress,
          type: 'local',
        })
        this.$router.push('/portfolio')
      } catch (err) {
        this.loading = false
        this.error = `The provided username or password is wrong.`
      }
    },
  },
  validations() {
    return {
      signInAddress: { required },
      signInPassword: { required, minLength: minLength(10) },
    }
  },
}
</script>
