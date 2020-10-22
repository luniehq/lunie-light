<template>
  <SessionFrame :icon="`lock`">
    <TmFormStruct :submit="onSubmit" class="session-container">
      <h2 class="session-title">Sign in with account</h2>
      <div class="session-main bottom-indent">
        <TmFormGroup field-id="sign-in-name" field-label="Select Account">
          <TmField
            id="sign-in-name"
            v-model="address"
            :options="accounts"
            type="select"
            placeholder="Select account…"
            vue-focus="vue-focus"
          />
          <!-- <TmFormMsg
            v-if="$v.signInAddress.$error && !$v.signInAddress.required"
            name="Name"
            type="required"
          /> -->
        </TmFormGroup>
        <!-- :error="$v.signInPassword.$error" -->
        <TmFormGroup field-id="sign-in-password" field-label="Password">
          <TmField id="sign-in-password" v-model="password" type="password" />
          <!-- 
          <TmFormMsg
            v-if="$v.signInPassword.$error && !$v.signInPassword.required"
            name="Password"
            type="required"
          />
          <TmFormMsg
            v-if="$v.signInPassword.$error && !$v.signInPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          /> -->
          <TmFormMsg v-if="error" type="custom" :msg="error" />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Sign In" :disabled="loading" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { getWalletIndex, testPassword } from '@lunie/cosmos-keys'
// import { required, minLength } from 'vuelidate/lib/validators'

export default {
  name: `sign-in`,
  data: () => ({
    address: undefined,
    password: ``,
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
    onSubmit() {
      // this.$v.$touch()
      // if (this.$v.$error) return
      this.loading = true

      try {
        testPassword(this.address, this.password)
        this.$store.dispatch('signIn', this.address)
        this.$router.push('/portfolio')
      } catch (err) {
        this.loading = false
        this.error = `The provided username or password is wrong.`
      }
    },
  },
  // validations() {
  //   return {
  //     signInAddress: { required },
  //     signInPassword: { required, minLength: minLength(10) },
  //   }
  // },
}
</script>
