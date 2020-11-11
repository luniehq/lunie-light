<template>
  <img
    v-if="validatorAddress && validatorPicture"
    class="validator-image"
    alt="validator logo - from keybase API"
    :src="validatorPicture"
    @click.prevent.self
    @click="$router.push(`/validators/${address}`)"
  />
  <div v-else class="validator-image" :style="{ background: hex }"></div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `avatar`,
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
      const validatorDict = this.validators.reduce(
        (map, obj) => ((map[obj.operatorAddress] = obj.picture), map), // eslint-disable-line
        {}
      )
      return validatorDict[this.address]
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
  height: 100%;
  width: 100%;
}
</style>
