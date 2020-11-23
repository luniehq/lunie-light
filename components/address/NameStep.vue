<template>
  <Form :submit="onSubmit">
    <h2 class="session-title">Create a new address</h2>
    <div class="session-main bottom-indent">
      <Warning>
        <h2 slot="title">🚨 Danger Zone</h2>
        <p slot="message">
          This feature is only for testing and development. Creating an address
          in the browser is not advised. Proceed with caution.
        </p>
      </Warning>
      <FormGroup
        :error="$v.fieldName.$error"
        field-id="sign-up-name"
        field-label="Account Name"
      >
        <Field
          id="sign-up-name"
          v-model.trim="fieldName"
          v-focus
          type="text"
          placeholder="Must be at least 3 characters"
        />
        <FormMessage
          v-if="$v.fieldName.$error && !$v.fieldName.required"
          name="Name"
          type="required"
        />
        <FormMessage
          v-if="$v.fieldName.$error && !$v.fieldName.minLength"
          name="Name"
          type="minLength"
          min="3"
        />
        <FormMessage
          v-if="$v.fieldName.$error && !$v.fieldName.nameExists"
          name="Name"
          type="custom"
          msg="already exists"
        />
      </FormGroup>
    </div>
    <div class="session-footer">
      <Button value="Next" type="submit" />
    </div>
  </Form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import { getWalletIndex } from '~/common/keystore'

const nameExists = (value) => {
  const walletIndex = getWalletIndex()
  if (walletIndex.some((e) => e.name === value)) {
    return false
  } else {
    return true
  }
}

export default {
  name: `NameStep`,
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
  },
  validations: () => ({
    fieldName: { required, minLength: minLength(3), nameExists },
  }),
}
</script>
