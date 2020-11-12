<template>
  <div>
    <Balances />
    <Delegations />
    <Undelegations />
  </div>
</template>

<script>
export default {
  name: `page-portfolio`,
  middleware: 'addressRequired',
}
</script>
