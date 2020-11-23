<template>
  <div class="seed-phrase">
    <Warning>
      <h2 slot="title">🚨 Warning</h2>
      <p slot="message">
        This seed phrase is all that is needed to access your account. Make sure
        to store it in a safe place. If lost or stored incorrectly, this seed
        cannot be recovered.
      </p>
    </Warning>
    <table class="seed-table">
      <tr>
        <td v-for="(word, index) in splitSeed.slice(0, 6)" :key="index">
          <span class="word-number" notranslate>{{ index + 1 }}</span>
          {{ word }}
        </td>
      </tr>
      <tr>
        <td v-for="(word, index) in splitSeed.slice(6, 12)" :key="index">
          <span class="word-number" notranslate>{{ index + 7 }}</span>
          {{ word }}
        </td>
      </tr>
      <tr>
        <td v-for="(word, index) in splitSeed.slice(12, 18)" :key="index">
          <span class="word-number" notranslate>{{ index + 13 }}</span>
          {{ word }}
        </td>
      </tr>
      <tr>
        <td v-for="(word, index) in splitSeed.slice(18, 24)" :key="index">
          <span class="word-number" notranslate>{{ index + 19 }}</span>
          {{ word }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: `Seed`,
  props: {
    value: {
      type: String,
      default: ``,
    },
  },
  data: () => ({
    copySuccess: false,
  }),
  computed: {
    splitSeed() {
      return this.value.split(` `)
    },
  },
  methods: {
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    },
  },
}
</script>
<style scoped>
.seed-table {
  width: calc(100% + 8px);
  border-spacing: 4px;
  border-collapse: separate;
  margin: 1rem -4px;
}

.seed-table td {
  text-align: center;
  width: 16.6666666666667%;
  background-color: var(--gray-100);
  border: 1px solid var(--gray-200);
  padding: 0.5rem 0.1rem 0.5rem 0.1rem;
  box-shadow: 0 0 2px 0 var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  color: var(--bright);
}

.seed-table td .word-number {
  display: block;
  width: 100%;
  opacity: 0.5;
  font-size: 10px;

  /* Prevent user to copy word numbers, we only want the words in their correct order */
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}

@media screen and (max-width: 360px) {
  .seed-table td {
    padding: 0.5rem 0.1rem 0.5rem 0.1rem;
    border-radius: var(--border-radius);
    font-size: 0.7rem;
  }
}

@media screen and (min-width: 361px) and (max-width: 667px) {
  .seed-table td {
    font-size: 0.8rem;
  }
}
</style>
