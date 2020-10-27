<template>
  <SessionFrame :icon="`language`">
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title bottom-indent">Explore with any address</h2>
      <div class="session-main">
        <TmFormGroup field-id="sign-in-name" field-label="Your Address">
          <TmField
            v-model.trim="address"
            type="text"
            placeholder
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.address.$error && !$v.address.required"
            name="Address"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.addressValidate"
            type="custom"
            :msg="addressError"
          />
          <TmFormMsg v-if="error" :name="error" type="custom" />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Explore" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { decodeB32 } from '~/common/address'
import network from '~/common/network'

export default {
  name: `session-explore`,
  data: () => ({
    address: ``,
    error: ``,
    network,
  }),
  methods: {
    onSubmit() {
      this.error = null
      this.$v.$touch()
      if (this.$v.$error) return

      this.$store.dispatch('signIn', {
        address: this.address,
        type: 'explore',
      })
      this.$router.push('/portfolio')
    },
    bech32Validation(address) {
      try {
        decodeB32(address)
        return true
      } catch (error) {
        this.addressError = String(error).slice(7)
        return false
      }
    },
    prefixValidation(address) {
      if (address.startsWith(this.network.address_prefix)) {
        return true
      } else {
        this.addressError = `Address is not valid for this network`
        return false
      }
    },
  },
  validations() {
    return {
      address: {
        required,
        bech32Validation: this.bech32Validation,
        prefixValidation: this.prefixValidation,
      },
    }
  },
}
</script>
<style scoped>
.tm-li-session {
  display: flex;
  padding: 1rem;
  margin: 0.5rem 0;
  background-color: var(--app-fg);
  border-radius: 0.25rem;
}

.tm-li-session:hover {
  cursor: pointer;
  background: var(--app-fg-hover);
}

.tm-li-session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-li-session-icon i {
  font-size: 1.25rem;
}

.tm-li-session-title {
  color: var(--bright);
  font-size: var(--h4);
  font-weight: 400;
  margin-top: -0.4rem;
}

.tm-li-session-subtitle {
  display: block;
  width: 100%;
  font-size: var(--h6);
  font-weight: 400;
  color: var(--dim);
}

.tm-li-session-text {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  padding: 0 1rem;
}

.material-icons.circle {
  border: 2px solid var(--dim);
  color: var(--dim);
  border-radius: 50%;
  padding: 0.5rem;
}

.button {
  min-width: 90px;
}
</style>
