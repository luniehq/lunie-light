<template>
  <select
    v-if="type === 'select'"
    :disabled="isDisabled"
    :value="value"
    class="field"
    @input="updateValue($event.target.value)"
  >
    <option
      v-for="(option, index) in selectOptions"
      :key="index"
      :value="option.value"
    >
      {{ option.key }}
    </option>
  </select>

  <textarea
    v-else-if="type === 'textarea'"
    :placeholder="placeholder"
    :disabled="isDisabled"
    :value="value"
    class="field"
    @input="updateValue($event.target.value)"
  />

  <div
    v-else
    class="input-row"
    :class="{ field: addOn, disabled: isDisabled && addOn }"
  >
    <input
      :placeholder="placeholder"
      :disabled="isDisabled"
      :type="type"
      :value="value"
      :class="{ field: !addOn }"
      step="0.000001"
      @input="updateValue($event.target.value)"
    />
    <div v-if="addOn" class="add-on">{{ addOn }}</div>
  </div>
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
    addOn: {
      type: String,
      default: null,
    },
  },
  computed: {
    selectOptions() {
      if (this.type === `select`) {
        return this.options || []
      }
      return []
    },
  },
  methods: {
    updateValue(value) {
      this.$emit(`input`, value)
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
  font-size: var(--text-sm);
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

.input-row {
  display: flex;
  width: 100%;
  align-items: center;
}

.add-on {
  background: var(--gray-300);
  color: var(--gray-600);
  font-size: var(--text-sm);
  padding: 0 0.5rem;
  border-radius: 2px;
  font-weight: 500;
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
  border: 0;
  outline: none;
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
textarea[disabled].field,
.input-row.disabled {
  background: var(--gray-300);
  border: 2px solid var(--gray-400);
  color: var(--gray-600);
}
</style>
