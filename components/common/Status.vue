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
  padding: 2px 6px;
  border-radius: var(--border-radius);
  width: fit-content;
  text-align: center;
}

.status.inactive {
  background: var(--orange-200);
  color: var(--orange-800);
}

.status.passed,
.status.active {
  background: var(--green-200);
  color: var(--green-800);
}

.status.rejected {
  background: var(--red-200);
  color: var(--red-800);
}

.status.voting {
  background: var(--teal-200);
  color: var(--teal-800);
}

.status.depositing {
  background: var(--purple-200);
  color: var(--purple-800);
}
</style>
