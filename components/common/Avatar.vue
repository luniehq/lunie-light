<template>
  <div :style="{ background: hex }"></div>
</template>

<script>
export default {
  name: `avatar`,
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  computed: {
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
