<template>
  <div :class="cssClass">
    <label v-if="fieldId && fieldLabel" :for="fieldId" class="label">
      {{ fieldLabel }}
    </label>
    <div class="field-container">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: `FormGroup`,
  props: {
    error: {
      type: Boolean,
      default: false,
    },
    fieldId: {
      type: String,
      default: null,
    },
    fieldLabel: {
      type: String,
      default: null,
    },
  },
  computed: {
    cssClass() {
      let value = `form-group`
      if (this.error) value += ` error`
      return value
    },
  },
}
</script>

<style scoped>
.form-group {
  padding: 0.75rem 0;
}

.label {
  display: block;
  line-height: 1.75rem;
  font-size: var(--text-xs);
  color: var(--dim);
  font-weight: 500;
}

.field-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.form-message {
  font-size: var(--text-xs);
  color: var(--txt);
  padding-top: 0.5rem;
  font-weight: 600;
  font-style: italic;
}

.row {
  display: flex;
  flex-direction: row;
}
</style>
