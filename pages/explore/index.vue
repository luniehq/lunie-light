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
          <!-- <TmFormMsg
            v-if="$v.address.$error && !$v.address.required"
            name="Address"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.addressValidate"
            type="custom"
            :msg="addressError"
          /> -->
          <!-- <TmFormMsg v-if="error" :name="error" type="custom" /> -->
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Explore" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
// import { required } from "vuelidate/lib/validators"
import { formatAddress } from '~/common/address'

export default {
  name: `session-explore`,
  filters: {
    formatAddress,
  },
  data: () => ({
    address: ``,
    error: ``,
  }),
  methods: {
    onSubmit() {
      this.error = null
      // this.$v.$touch()
      // if (this.$v.$error) return

      this.$store.dispatch('signIn', this.address)
      this.$router.push('/portfolio')
    },
  },
  // validations() {
  //   return {
  //     address: {
  //       required,
  //       addressValidate: this.addressValidate,
  //     },
  //   }
  // },
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
