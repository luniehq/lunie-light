<template>
  <TmFormStruct :submit="onSubmit">
    <h2 class="session-title">Recover with backup code</h2>
    <div class="session-main bottom-indent">
      <!-- :error="$v.$error && $v.seed.$invalid" -->
      <TmFormGroup field-id="import-seed" field-label="Backup code">
        <FieldSeed
          id="import-seed"
          :value="fieldSeed"
          :placeholder="'Must be exactly 12 or 24 words'"
          @input="(val) => (fieldSeed = val)"
        />
        <!-- <TmFormMsg
          v-if="$v.seed.$error && !$v.seed.required"
          name="Seed"
          type="required"
        />
        <TmFormMsg
          v-else-if="$v.seed.$error && !$v.seed.seedHasCorrectLength"
          name="Seed"
          :type="isPolkadot ? 'incorrectPolkadotSeed' : 'words12or24'"
        />
        <TmFormMsg
          v-else-if="$v.seed.$error && !$v.seed.seedIsLowerCaseAndSpaces"
          name="Seed"
          :type="isPolkadot ? 'incorrectPolkadotSeed' : 'lowercaseAndSpaces'"
        /> -->
      </TmFormGroup>
    </div>
    <div class="session-footer">
      <TmBtn value="Next" type="submit" />
    </div>
  </TmFormStruct>
</template>

<script>
// import { required } from 'vuelidate/lib/validators'

// const has12or24words = (param) => {
//   return (
//     param && (param.split(` `).length === 12 || param.split(` `).length === 24)
//   )
// }

// const lowerCaseAndSpaces = (param) => {
//   const seedWordsAreLowerCaseAndSpaces = /^([a-z]+\s)*[a-z]+$/g
//   if (param.match(seedWordsAreLowerCaseAndSpaces)) {
//     return param === param.match(seedWordsAreLowerCaseAndSpaces)[0]
//   }
//   return false
// }

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
      // this.$v.$touch()
      // if (this.$v.seed.$invalid || this.$v.seed.$invalid) return
      this.$emit('submit', this.fieldSeed)
    },
  },
  // validations() {
  //   return {
  //     seed: {
  //       required,
  //       seedIsLowerCaseAndSpaces: (param) =>
  //         this.isPolkadot
  //           ? polkadotValidation(param)
  //           : lowerCaseAndSpaces(param),
  //       seedHasCorrectLength: (param) =>
  //         this.isPolkadot ? polkadotValidation(param) : has12or24words(param),
  //     },
  //   }
  // },
}
</script>
