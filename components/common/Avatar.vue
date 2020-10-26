<template>
  <div :style="{ background: gradient }"></div>
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
    gradient() {
      const hex1 = '#' + Math.floor(Math.random() * 16777215).toString(16)
      const hex2 = '#' + Math.floor(Math.random() * 16777215).toString(16)

      return 'linear-gradient(130deg, ' + hex1 + ' 0%, ' + hex2 + ' 100%)'
    },
  },
}
</script>
