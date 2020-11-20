<template>
  <div class="loader">
    <img
      :src="require(`../../assets/images/loader.svg`)"
      alt="circular loading icon"
    />
  </div>
</template>
<script>
export default {
  name: 'Loader',
}
</script>

<style scoped>
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 2rem;
}

img {
  height: 2rem;
  width: 2rem;
}
</style>
