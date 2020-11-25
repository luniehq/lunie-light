<template>
  <div class="portfolio">
    <Balances />
    <Delegations />
    <Undelegations />
  </div>
</template>

<script>
export default {
  name: `PagePortfolio`,
  middleware: 'addressRequired',
}
</script>
<style scoped>
.portfolio {
  background: var(--gray-100);
  min-height: 100vh;
}
</style>
