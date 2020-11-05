<template>
  <TmFormStruct :submit="onSubmit.bind(this)">
    <h2 class="session-title">Confirm seed</h2>
    <div v-if="fieldSeed && !$v.fieldSeed.$error" class="seed-container">
      <p class="title">Seed Phrase</p>
      <p class="length">{{ fieldSeed.split(` `).length }} words</p>
      <span
        v-for="word in fieldSeed.split(` `)"
        :key="word"
        class="seed-word"
        >{{ word }}</span
      >
    </div>
    <div v-else class="session-main bottom-indent reorder">
      <TmFormGroup
        :error="$v.fieldSeed.$error"
        class="field-checkbox"
        field-id="confirm-seed"
        field-label
      >
        <TmField
          id="seed"
          v-model.trim="fieldSeed"
          v-focus
          type="text"
          placeholder="Paste your seed here"
          vue-focus="vue-focus"
        />
        <TmFormMsg
          v-if="$v.fieldSeed.$error && !$v.fieldSeed.required"
          name="Confirmation seed"
          type="required"
        />
        <TmFormMsg
          v-if="$v.fieldSeed.$error && !$v.fieldSeed.has24Words"
          name="Seed"
          type="custom"
          :msg="`must have 24 words`"
        />
        <TmFormMsg
          v-if="$v.fieldSeed.$error && !$v.fieldSeed.isValidSeed"
          name="Seed"
          type="custom"
          :msg="`must equal the backup seed`"
        />
      </TmFormGroup>
    </div>
    <div class="buttons-container">
      <div v-if="fieldSeed && !$v.fieldSeed.$error" class="footer-button">
        <TmBtn value="Retry" @click="retry()" />
      </div>
      <div class="footer-button">
        <TmBtn type="submit" value="Confirm" />
      </div>
    </div>
  </TmFormStruct>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

export default {
  name: `confirm-seed-step`,
  props: {
    seed: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    fieldSeed: undefined,
  }),
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$emit('submit', this.fieldSeed)
    },
    retry() {
      this.fieldSeed = undefined
      // TODO: rerender TmField
    },
  },
  validations() {
    return {
      fieldSeed: {
        required,
        has24Words: (x) => x.split(` `).length === 24,
        isValidSeed: (x) => x === this.seed,
      },
    }
  },
}
</script>
<style scoped>
.seed-container {
  position: relative;
  margin-top: 1em;
  background-color: #07080c;
  padding: 0.5em;
  border-radius: 0.25em;
}

.seed-word {
  background-color: #b0bade;
  color: #07080c;
  display: inline-block;
  padding: 0.2em 0.8em 0.3em 0.8em;
  border-radius: 0.2em;
  font-weight: 500;
  margin: 0.25rem;
}

.seed-container .title {
  color: var(--bright);
  font-size: 70%;
  margin: 0 0 0.5rem 0.25em;
}

.seed-container .length {
  position: absolute;
  color: #9ca6c7;
  font-size: 70%;
  top: 0.25em;
  right: 0.75em;
}

.buttons-container {
  display: flex;
  justify-content: flex-end;
}

.footer-button {
  padding: 1.5rem 0 1rem;
  margin-left: 2rem;
}

input.tm-field {
  height: 8rem !important;
}
</style>
