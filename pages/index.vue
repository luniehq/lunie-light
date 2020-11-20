<template>
  <div>
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
