<template>
  <div
    class="validator-image"
    :style="`background-image: url(${validatorPicture}); background-color: ${hex};`"
    @click.prevent.self
    @click="$router.push(`/validators/${address}`)"
  />
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `Avatar`,
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState('data', ['validators']),
    validatorAddress() {
      return !!this.address.includes('valoper')
    },
    validatorPicture() {
      const validator = this.validators.find(
        ({ operatorAddress }) => operatorAddress === this.address
      )
      return validator ? validator.picture : undefined
    },
    hash() {
      let hash = 0
      for (let i = 0; i < this.address.length; i++) {
        hash = this.address.charCodeAt(i) + ((hash << 5) - hash)
      }
      return hash
    },
    hex() {
      const x = (this.hash & 0x00ffffff).toString(16).toUpperCase() // eslint-disable-line
      return '#' + '00000'.substring(0, 6 - x.length) + x
    },
  },
}
</script>
<style scoped>
.validator-image {
  border-radius: 50%;
  max-height: 100%;
  max-width: 100%;
  background-size: contain;
  height: 2.5rem;
  min-height: 2.5rem;
  width: 2.5rem;
  min-width: 2.5rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
}
</style>
