<template>
  <TmFormStruct :submit="onSubmit">
    <h2 class="session-title">Choose name</h2>
    <div class="session-main bottom-indent">
      <TmFormGroup field-id="import-name" field-label="Address">
        <p class="address">
          {{ address }}
        </p>
      </TmFormGroup>

      <TmFormGroup
        :error="$v.$error && $v.name.$invalid"
        field-id="import-name"
        field-label="Account Name"
      >
        <TmField
          id="import-name"
          v-model.trim="fieldName"
          type="text"
          placeholder="Must have at least 3 characters"
          vue-focus="vue-focus"
        />
        <TmFormMsg
          v-if="$v.name.$error && !$v.name.required"
          name="Name"
          type="required"
        />
        <TmFormMsg
          v-if="$v.name.$error && !$v.name.minLength"
          name="Name"
          type="minLength"
          min="3"
        />
        <TmFormMsg
          v-if="$v.name.$error && !$v.name.nameExists"
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
import { getWalletIndex } from '@lunie/cosmos-keys'

const nameExists = (value) => {
  const walletIndex = getWalletIndex()
  if (walletIndex.some((e) => e.name === value)) {
    return false
  } else {
    return true
  }
}

export default {
  name: `import-name-step`,
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
      if (this.$v.name.$invalid) return
      this.$emit('submit', this.fieldName)
    },
  },
  validations: () => ({
    name: { required, minLength: minLength(3), nameExists },
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
