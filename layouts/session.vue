<template>
  <div class="session-layout lunie-light">
    <div class="session">
      <div v-if="$route.path !== '/welcome'" class="session-header">
        <a @click="goBack">
          <i class="material-icons notranslate circle back">arrow_back</i>
        </a>
        <div class="session-close">
          <a @click="closeModal()">
            <i class="material-icons notranslate circle back">close</i>
          </a>
        </div>
      </div>
      <Nuxt></Nuxt>
    </div>
    <div class="disclaimer">
      <p>
        Use this software at your own risk. Never enter your seed phrase into
        untrusted software. Beware of phishing scams and spoof sites. Have a
        nice day <span>✌️</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: `SessionLayout`,
  components: {},
  middleware({ store }) {
    if (!store.state.data.api) {
      store.dispatch('data/init') // init api
    }
  },
  methods: {
    closeModal() {
      this.$router.push(`/validators`)
    },
    goBack() {
      this.$router.go(`-1`)
    },
  },
}
</script>

<style>
.session-layout {
  min-height: 100vh;
  background: var(--app-fg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
}

.session {
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: 0 0 3px 0 var(--gray-400);
  padding: 2.5rem 2rem;
  position: relative;
  max-width: 540px;
  margin: 2rem 0;
  width: 100%;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  padding-bottom: 2rem;
}

.session-title {
  font-size: var(--text-3xl);
  line-height: 42px;
  color: var(--bright);
  font-weight: 500;
  padding: 1rem 0;
  text-align: center;
}

.session-list {
  padding: 1rem 0;
}

.session-main {
  padding: 1rem;
}

.session-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem 0 1rem;

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
  align-self: flex-end;
}

.footnote {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: var(--text-sm);
}

.session-back {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.error-container {
  padding: 1rem;
  font-size: var(--text-base);
  color: var(--gray-600);
}

.error-container p {
  margin-bottom: 0.5rem;
}

.error {
  color: var(--red-600);
}

.session .material-icons.circle.back {
  background: var(--gray-200);
  color: var(--dim);
  border-radius: 50%;
  padding: 0.25rem;
  cursor: pointer;
  font-size: var(--text-base);
}

.session .material-icons.circle:hover {
  background: var(--gray-300);
}

.disclaimer {
  font-size: 11px;
  color: var(--red-700);
  text-align: center;
  line-height: 1rem;
  padding: 2rem;
  max-width: 540px;
  font-weight: 700;
}

@media screen and (max-width: 667px) {
  .session-layout {
    background: var(--white);
  }

  .session {
    padding: 2rem 1rem;
    border-radius: 0;
    box-shadow: none;
    max-width: none;
    margin: 0;
    min-height: 80vh;
  }

  .disclaimer {
    max-width: none;
    background: var(--white);
  }
}
</style>
