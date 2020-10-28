<template>
  <TmFormStruct :submit="onSubmit">
    <h2 class="session-title">Recover with backup code</h2>
    <div class="session-main bottom-indent">
      <TmFormGroup
        :error="$v.$error && $v.fieldSeed.$invalid"
        field-id="import-seed"
        field-label="Backup code"
      >
        <FieldSeed
          id="import-seed"
          :value="fieldSeed"
          :placeholder="'Must be exactly 12 or 24 words'"
          @input="(val) => (fieldSeed = val)"
        />
        <TmFormMsg
          v-if="$v.fieldSeed.$error && !$v.fieldSeed.required"
          name="Seed"
          type="required"
        />
        <TmFormMsg
          v-else-if="$v.fieldSeed.$error && !$v.fieldSeed.seedHasCorrectLength"
          name="Seed"
          :type="isPolkadot ? 'incorrectPolkadotSeed' : 'words12or24'"
        />
        <TmFormMsg
          v-else-if="
            $v.fieldSeed.$error && !$v.fieldSeed.seedIsLowerCaseAndSpaces
          "
          name="Seed"
          :type="isPolkadot ? 'incorrectPolkadotSeed' : 'lowercaseAndSpaces'"
        />
      </TmFormGroup>
    </div>
    <div class="session-footer">
      <TmBtn value="Next" type="submit" />
    </div>
  </TmFormStruct>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

const has12or24words = (param) => {
  return (
    param && (param.split(` `).length === 12 || param.split(` `).length === 24)
  )
}

const lowerCaseAndSpaces = (param) => {
  const seedWordsAreLowerCaseAndSpaces = /^([a-z]+\s)*[a-z]+$/g
  if (param.match(seedWordsAreLowerCaseAndSpaces)) {
    return param === param.match(seedWordsAreLowerCaseAndSpaces)[0]
  }
  return false
}

export default {
  name: `import-seed-step`,
  props: {
    seed: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    fieldSeed: undefined,
  }),
  mounted() {
    this.fieldSeed = this.seed
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.fieldSeed.$invalid || this.$v.fieldSeed.$invalid) return
      this.$emit('submit', this.fieldSeed)
    },
  },
  validations() {
    return {
      fieldSeed: {
        required,
        seedIsLowerCaseAndSpaces: (param) => lowerCaseAndSpaces(param),
        seedHasCorrectLength: (param) => has12or24words(param),
      },
    }
  },
}
</script>
