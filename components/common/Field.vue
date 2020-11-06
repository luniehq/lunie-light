<template>
  <div v-if="type === 'select'" class="select">
    <select
      class="field"
      :value="value"
      :disabled="isDisabled"
      @input="updateValue($event.target.value)"
      @keyup="onKeyup"
      @keydown="onKeydown"
    >
      <option value disabled="disabled" selected="selected" hidden="hidden">
        {{ selectPlaceholder }}
      </option>
      <option
        v-for="(option, index) in resolvedOptions"
        :key="index"
        :value="option.value"
      >
        {{ option.key }}
      </option>
    </select>
    <div class="select-addon">
      <i class="material-icons notranslate">arrow_drop_down</i>
    </div>
  </div>

  <textarea
    v-else-if="type === 'textarea'"
    class="field"
    :placeholder="placeholder"
    :value="value"
    @keyup="onKeyup"
    @keydown="onKeydown"
    @input="updateValue($event.target.value)"
  />

  <input
    v-else
    ref="numTextInput"
    class="field"
    :type="type"
    :placeholder="placeholder"
    :value="value"
    step="0.000001"
    :disabled="isDisabled"
    @keyup="onKeyup"
    @keydown="onKeydown"
    @input="updateValue($event.target.value)"
  />
</template>

<script>
export default {
  name: `field`,
  props: {
    type: {
      type: String,
      default: `input`,
    },
    value: {
      type: [String, Number, Boolean, Array],
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    options: {
      type: [Array, Object],
      default: null,
    },
    keyup: {
      type: Function,
      default: null,
    },
    keydown: {
      type: Function,
      default: null,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    resolvedOptions() {
      if (this.type === `select`) {
        return this.options || []
      }
      return []
    },
    selectPlaceholder() {
      if (this.placeholder) return this.placeholder
      else return `Select option...`
    },
  },
  methods: {
    updateValue(value) {
      let formattedValue = value

      if (this.type === `number`) {
        formattedValue = value.trim()
      }

      // Emit the number value through the input event
      this.$emit(`input`, formattedValue)
    },
    onKeyup(...args) {
      if (this.keyup) return this.keyup(...args)
    },
    onKeydown(...args) {
      if (this.keydown) return this.keydown(...args)
    },
  },
}
</script>

<style scoped>
.select {
  position: relative;
  width: 100%;
}

.select select {
  appearance: none;
  background: var(--transparent);
  color: var(--txt);
  padding-right: 2rem;
  width: 100%;
}

.select select:invalid {
  color: var(--dim);
}

.select select option {
  background: var(--app-bg);
  color: var(--txt);
}

.select .select-addon {
  align-items: center;
  background: var(--transparent);
  box-sizing: border-box;
  color: var(--txt);
  display: flex;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  right: 0;
  text-align: center;
  top: 0;
  width: 2rem;
  height: 100%;
}

input[readonly],
input[disabled],
textarea[readonly],
textarea[disabled] {
  background: var(--gray-200);
}

input[type='radio'] {
  margin: 0;
}

.input-suffix {
  background: transparent;
  display: inline-block;
  position: absolute;
  padding: 7px;
  font-size: var(--text-xs);
  text-transform: uppercase;
  top: 2px;
  right: 30px;
  letter-spacing: 1px;
  text-align: right;
  font-weight: 500;
  border-radius: var(--border-radius);
}

.input-suffix.max-button {
  right: 124px;
}

.field-checkbox-input {
  display: block;
  line-height: 14px;
  font-size: 14px;
}

.field-checkbox-label {
  color: var(--bright);
  display: inline-block;
  padding-left: 1.5rem;
  text-indent: -1.5rem;
  line-height: 14px;
}

input[type='checkbox'] {
  margin: 0.3rem 0.3rem 0.5rem 0;
  vertical-align: middle;
}

.field,
.field-addon {
  background: var(--transparent);
  border: 2px solid var(--input-bc);
  color: var(--txt);
  display: block;
  font-size: 14px;
  min-width: 0;
  width: 100%;
  box-shadow: 0 0 1px 0 var(--gray-300);
}

.field {
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
}

.field-addon {
  padding: 0.5rem 0.5rem;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.field-group {
  width: 100%;
}

.field::placeholder {
  color: var(--dim);
}

.field:disabled {
  background: var(--gray-200);
  border: 2px solid var(--gray-900);
  box-shadow: none;
  color: var(--dim);
  text-shadow: none;
}

.field:focus {
  border: 2px solid var(--link);
  box-shadow: none;
  outline: none;
}

textarea.field {
  height: 4rem;
  resize: vertical;
}

.input-group-addon {
  background: var(--transparent);
  border: 2px solid var(--input-bc);
  border-left: none;
  color: var(--txt);
  font-size: 0.75rem;
  line-height: 1.875rem;
  padding: 0 0.5rem;
}

@media screen and (min-width: 360px) {
  .input-group-addon {
    font-size: 1rem;
  }
}
</style>
