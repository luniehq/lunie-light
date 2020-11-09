<template>
  <div class="form-group">
    <label v-if="fieldId && fieldLabel" :for="fieldId" class="label">
      {{ fieldLabel }}
    </label>
    <div class="field-container">
      <slot />
      <div>
        <slot name="errors" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: `form-group`,
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
}
</script>

<style scoped>
.form-group {
  padding: 0.75rem 0;
  position: relative;
}

.label {
  display: block;
  line-height: 2rem;
  font-size: var(--text-xs);
  color: var(--dim);
  text-align: left;
  font-weight: 500;
}

.field-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
