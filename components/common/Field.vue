<template>
  <div v-if="type === 'select'" class="select">
    <select
      :class="css"
      :value="value"
      :disabled="isDisabled"
      @input="updateValue($event.target.value)"
      @change="onChange"
      @keyup="onKeyup"
      @keydown="onKeydown"
    >
      <option value disabled="disabled" selected="selected" hidden="hidden">
        {{ selectPlaceholder }}
      </option>
      <template>
        <option
          v-for="(option, index) in resolvedOptions"
          :key="index"
          :value="option.value"
        >
          {{ option.key }}
        </option>
      </template>
    </select>
    <div class="field-select-addon">
      <i class="material-icons notranslate">arrow_drop_down</i>
    </div>
  </div>

  <textarea
    v-else-if="type === 'textarea'"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    @change="onChange"
    @keyup="onKeyup"
    @keydown="onKeydown"
    @input="updateValue($event.target.value)"
  />

  <input
    v-else
    ref="numTextInput"
    :type="type"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    step="0.000001"
    :disabled="isDisabled"
    @change="onChange"
    @keyup="onKeyup"
    @keydown="onKeydown"
    @input="updateValue($event.target.value)"
  />
</template>

<script>
export default {
  name: `Field`,
  props: {
    type: {
      type: String,
      default: `text`,
    },
    value: {
      type: [String, Number, Boolean, Array],
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    options: {
      type: [Array, Object],
      default: null,
    },
    change: {
      type: Function,
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
    css() {
      let value = `field`
      if (this.type === `select`) {
        value += ` field-select`
      }
      if (this.size) value += ` field-size-${this.size}`
      return value
    },
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
    onChange(...args) {
      if (this.type === `number` && this.$refs.numTextInput) {
        this.$refs.numTextInput.focus()
      }
      if (this.change) return this.change(...args)
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
input[type='checkbox'] {
  margin: 0.3rem 0.3rem 0.5rem 0;
  vertical-align: middle;
}

.field {
  background: var(--transparent);
  border: 2px solid var(--input-bc);
  border-radius: var(--border-radius);
  color: var(--txt);
  display: block;
  font-size: 14px;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  width: 100%;
  -webkit-appearance: none;
}

.field-addon {
  background: var(--transparent);
  border: 2px solid var(--input-bc);
  border-radius: var(--border-radius);
  color: var(--txt);
  display: block;
  font-size: 14px;
  min-width: 0;
  padding: 0.5rem 0.5rem;
  width: 100%;
  -webkit-appearance: none;
  border-top-left-radius: 0.25rem !important;
  border-bottom-left-radius: 0.25rem !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.field-group {
  width: 100%;
}

.field::placeholder {
  color: var(--dim);
}

.field:disabled {
  background: var(--app-fg);
  border: 2px solid black;
  box-shadow: none;
  color: var(--dim);
  text-shadow: none;
}

.field:focus {
  border: 2px solid var(--link);
  box-shadow: none;
  outline: none;
}

input.field {
  height: 2rem;
}

textarea.field {
  height: 4rem;
  resize: vertical;
}

.select {
  position: relative;
  width: 100%;
}

.select select {
  appearance: none;
  background: var(--transparent);
  border-radius: 0;
  color: var(--txt, #333);
  padding-right: 2rem;
  width: 100%;
}

.select select:invalid {
  color: dim;
}

.select select option {
  background: var(--app-bg);
  color: var(--txt);
}

.select .field-select-addon {
  align-items: center;
  background: var(--transparent);
  border-left: 1px solid var(--input-bc);
  box-sizing: border-box;
  color: var(--txt, #333);
  display: flex;
  height: 2rem;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  right: 0;
  text-align: center;
  top: 0;
  width: auto;
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

input[readonly],
input[disabled],
textarea[readonly],
textarea[disabled] {
  background: var(--bc-dim) !important;
}

input[type='radio'] {
  margin: 0;
}

.li-container {
  margin-right: 1rem;
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

.field-checkbox-label {
  display: inline-block;
  padding-left: 1.5rem;
  text-indent: -1.5rem;
  line-height: 14px;
}

@media screen and (min-width: 360px) {
  .input-group-addon {
    font-size: 1rem;
  }
}

.field.field-size-sm {
  font-size: 0.75rem;
  height: 1.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.field.field-size-lg {
  font-size: 1.125rem;
  height: 3rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
</style>
