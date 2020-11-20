<template>
  <div>
    <Form :submit="onSubmit" class="session-container">
      <h2 class="session-title">Sign in with account</h2>
      <div class="session-main bottom-indent">
        <FormGroup field-id="sign-in-name" field-label="Select Account">
          <Field
            id="sign-in-name"
            v-model="signInAddress"
            v-focus
            :options="accounts"
            type="select"
            placeholder="Select account…"
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
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import { getWallet, getWalletIndex } from '~/common/keystore'

export default {
  name: `SessionSignIn`,
  layout: 'session',
  middleware: 'localSigning',
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
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.loading = true

      try {
        const { Secp256k1HdWallet } = await import('@cosmjs/launchpad')
        const { wallet } = getWallet(this.signInAddress)
        await Secp256k1HdWallet.deserialize(wallet, this.signInPassword)
        this.$store.dispatch('signIn', {
          address: this.signInAddress,
          sessionType: 'local',
        })
        this.$router.push('/')
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
