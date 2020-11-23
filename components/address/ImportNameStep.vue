<template>
  <Form :submit="onSubmit">
    <h2 class="session-title">Choose name</h2>
    <div class="session-main bottom-indent">
      <FormGroup field-id="import-name" field-label="Address">
        <p class="address">
          {{ address }}
        </p>
      </FormGroup>

      <FormGroup
        :error="$v.$error && $v.fieldName.$invalid"
        field-id="import-name"
        field-label="Account Name"
      >
        <Field
          id="import-name"
          v-model.trim="fieldName"
          v-focus
          type="text"
          placeholder="Must have at least 3 characters"
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
  name: `ImportNameStep`,
  props: {
    address: {
      type: String,
      required: true,
    },
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
      if (this.$v.fieldName.$invalid) return
      this.$emit('submit', this.fieldName)
    },
  },
  validations: () => ({
    fieldName: { required, minLength: minLength(3), nameExists },
  }),
}
</script>
<style scoped>
.address {
  word-break: break-all;
  font-size: 0.9rem;
  color: var(--txt);
}

.tm-form-group__field {
  position: unset !important;
}
</style>
