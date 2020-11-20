<template>
  <select
    v-if="type === 'select'"
    class="field"
    :value="value"
    :disabled="isDisabled"
    @input="updateValue($event.target.value)"
    @change="onChange"
    @keyup="onKeyup"
    @keydown="onKeydown"
  >
    <option
      v-for="(option, index) in resolvedOptions"
      :key="index"
      :value="option.value"
    >
      {{ option.key }}
    </option>
  </select>

  <textarea
    v-else-if="type === 'textarea'"
    class="field"
    :placeholder="placeholder"
    :value="value"
    @change="onChange"
    @keyup="onKeyup"
    @keydown="onKeydown"
    @input="updateValue($event.target.value)"
  />

  <input
    v-else
    class="field"
    ref="numTextInput"
    :type="type"
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
    resolvedOptions() {
      if (this.type === `select`) {
        return this.options || []
      }
      return []
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
.field {
  background: var(--white);
  border: 2px solid var(--input-bc);
  border-radius: var(--border-radius);
  color: var(--bright);
  display: block;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
}

.field::placeholder {
  color: var(--gray-500);
}

.field:focus {
  border: 2px solid var(--link);
  outline: none;
}

.field-checkbox-label {
  display: inline-block;
  padding-left: 1.5rem;
  text-indent: -1.5rem;
  line-height: 14px;
}

select.field {
  padding-left: 0.25rem;
}

input + select {
  margin-left: 0.25rem;
  max-width: 10rem;
}

select:invalid {
  color: var(--dim);
}

select option {
  background: var(--app-bg);
  color: var(--txt);
}

textarea {
  width: 100%;
  min-height: 4rem;
  resize: vertical;
}

input {
  width: 100%;
}

input[type='checkbox'] {
  margin: 0.3rem 0.3rem 0.5rem 0;
  vertical-align: middle;
}

input[type='radio'] {
  margin: 0;
}

input[readonly].field,
input[disabled].field,
textarea[readonly].field,
textarea[disabled].field {
  background: var(--gray-300);
  border: 2px solid var(--gray-400);
  color: var(--gray-600);
}
</style>
