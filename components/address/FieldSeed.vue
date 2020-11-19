<template>
  <Field
    :value="value"
    class="tm-field-seed"
    type="textarea"
    @input="update($event)"
  />
</template>

<script>
export default {
  name: `FieldSeed`,
  props: {
    value: {
      type: String,
      default: undefined,
    },
  },
  watch: {
    value: {
      async handler() {
        await this.$nextTick()
      },
    },
  },
  methods: {
    update(value) {
      this.$emit(`input`, value)
    },
  },
}
</script>
<style scoped>
.tm-field:disabled.tm-field-seed {
  border: 1px solid var(--bc);
  line-height: 22px;
  padding: 0.5rem;
  min-height: 90px;
}

.field-seed {
  line-height: var(--text-xl);
  padding: 0.75rem;
  resize: none;
}
</style>
