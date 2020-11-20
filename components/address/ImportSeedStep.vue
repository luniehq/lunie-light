<template>
  <Form :submit="onSubmit">
    <h2 class="session-title">{{ title }}</h2>
    <div class="session-main bottom-indent">
      <FormGroup
        :error="$v.$error && $v.fieldSeed.$invalid"
        field-id="import-seed"
        field-label="Seed Phrase"
      >
        <FieldSeed
          id="import-seed"
          :value="fieldSeed"
          :placeholder="'Must be exactly 12 or 24 words'"
          @input="(val) => (fieldSeed = val)"
        />
        <FormMessage
          v-if="$v.fieldSeed.$error && !$v.fieldSeed.required"
          name="Seed"
          type="required"
        />
        <FormMessage
          v-else-if="$v.fieldSeed.$error && !$v.fieldSeed.seedHasCorrectLength"
          name="Seed"
          type="words12or24"
        />
        <FormMessage
          v-else-if="
            $v.fieldSeed.$error && !$v.fieldSeed.seedIsLowerCaseAndSpaces
          "
          name="Seed"
          type="lowercaseAndSpaces"
        />
      </FormGroup>
    </div>
    <div class="session-footer">
      <Button value="Next" type="submit" />
    </div>
  </Form>
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
  name: `ImportSeedStep`,
  props: {
    seed: {
      type: String,
      default: undefined,
    },
    title: {
      type: String,
      default: `Recover from seed phrase`,
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
