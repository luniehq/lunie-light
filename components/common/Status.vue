<template>
  <div
    class="status"
    :class="{
      active: status.value === `ACTIVE` || status.value === `PASSED`,
      inactive: status.value !== `ACTIVE` || status.value === `REJECTED`,
    }"
  >
    {{ status.value }}
  </div>
</template>

<script>
export default {
  name: `Status`,
  props: {
    status: {
      type: Object,
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
  padding: 2px 6px;
  border-radius: var(--border-radius);
  width: fit-content;
  text-align: center;
}

.status.inactive {
  background: var(--orange-200);
  color: var(--orange-800);
}

.status.active {
  background: var(--green-200);
  color: var(--green-800);
}
</style>
