<template>
  <TmPage :sign-in-required="true">
    <!-- <template slot="signInRequired"> -->
    <TmBalance />
    <DelegationsOverview />
    <Undelegations />
  </TmPage>
</template>

<script>
export default {
  name: `page-portfolio`,
}
</script>
