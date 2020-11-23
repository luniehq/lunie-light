<template>
  <div class="warning" :class="type">
    <slot name="title"> {{ title }} </slot>
    <slot name="message"> {{ message }}</slot>
  </div>
</template>

<script>
export default {
  name: `Warning`,
}
</script>

<style scoped>
.warning {
  border: 2px solid var(--orange-600);
  border-radius: var(--border-radius);
  background: var(--orange-100);
  padding: 1rem;
}

.warning h2 {
  font-weight: 700;
  font-size: var(--text-base);
  padding-bottom: 0.5rem;
}

.warning p {
  font-size: var(--text-xs);
  margin: 0;
}
</style>
