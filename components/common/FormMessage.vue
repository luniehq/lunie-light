<template>
  <div :class="cssClass">{{ name }} {{ error }}</div>
</template>

<script>
import { prettyDecimals } from '../../common/numbers'
export default {
  name: 'FormMessage',
  props: {
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: ``,
    },
    min: {
      type: [String, Number], // for convenience you can provide a string
      default: null,
    },
    max: {
      type: [String, Number], // for convenience you can provide a string
      default: null,
    },
    length: {
      type: Number,
      default: null,
    },
    msg: {
      type: String,
      default: ``,
    },
  },
  computed: {
    cssClass() {
      let value = `form-msg`
      if (this.type) {
        value += ` error`
      }
      return value
    },
    error() {
      let msg = ``
      switch (this.type) {
        case `alphaNum`:
          msg = `must contain only alphanumeric characters`
          break
        case `numeric`:
          msg = `must contain only numerals`
          break
        case `between`:
          msg = `must be between ${prettyDecimals(this.min)} and ${this.max}`
          break
        case `maxDecimals`:
          msg = `can have maximum 6 decimals`
          break
        case `min`:
          msg = `must be greater than ${prettyDecimals(this.min)}`
          break
        case `date`:
          msg = `must be a valid date`
          break
        case `datetime`:
          msg = `must be a valid date and time`
          break
        case `exactLength`:
          msg = `must be exactly ${this.length} characters`
          break
        case `ipAddress`:
          msg = `must be a valid IPv4 or IPv6 address`
          break
        case `length`:
          msg = `must be between ${this.min} and ${this.max} characters`
          break
        case `minLength`:
          msg = `must be equal or longer than ${this.min} characters`
          break
        case `match`:
          msg = `must match`
          break
        case `maxLength`:
          msg = `must be equal or shorter than ${this.max} characters`
          break
        case `required`:
          msg = `is required`
          break
        case `words16`:
          msg = `phrase must be 16 words`
          break
        case `words24`:
          msg = `phrase must be 24 words`
          break
        case `words12or24`:
          msg = `phrase must be 12 or 24 words`
          break
        case `lowercaseAndSpaces`:
          msg = `phrase words must be all lowercase and separated by spaces`
          break
        case `url`:
          msg = `must be a valid URL (http:// required)`
          break
        case `bech32`:
          msg = `is invalid bech32`
          break
        case `integer`:
          msg = `must be an integer`
          break
        case `custom`:
          msg = this.msg
          break
        default:
          msg = `must be valid`
          break
      }
      return msg
    },
  },
}
</script>

<style scoped>
.form-msg {
  padding: 0;
  display: flex;
  font-size: var(--text-xs);
}

.error {
  padding-top: 0.5rem;
  color: var(--danger);
  font-style: italic;
  font-weight: 600;
}
</style>
