<template>
  <div class="danger-zone">
    <h2>DANGER ZONE</h2>
    <p>
      Did you know that creating your address in the browser is considered
      unsafe? This option is only for testing and development.
    </p>
  </div>
</template>

<style scoped>
.danger-zone {
  border: 2px solid var(--danger);
  border-radius: 0.25rem;
  margin: 1rem 0;
  padding: 1rem;
}

.danger-zone p {
  font-size: var(--text-xs);
  color: var(--danger);
  margin: 0;
}

.danger-zone h2 {
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--danger);
  padding-bottom: 0.25rem;
}
</style>
