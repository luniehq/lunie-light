<template>
  <div class="status" :class="label.toLowerCase()">
    {{ label }}
  </div>
</template>

<script>
export default {
  name: `Status`,
  props: {
    label: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
.status {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 1rem;
  width: fit-content;
  text-align: center;
}

.status.inactive {
  background: var(--warning-faded);
  color: var(--warning);
}

.status.active {
  background: var(--success-faded);
  color: var(--success);
}
</style>
