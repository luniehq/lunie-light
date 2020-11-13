<template>
  <div class="session-frame lunie-light">
    <div class="session">
      <div class="session-header">
        <a :class="{ invisible: hideBack }" @click="goBack">
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
  </div>
</template>

<script>
export default {
  name: `session-frame`,
  components: {},
  props: {
    hideBack: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: ``,
    },
    onBack: {
      type: Function,
      default: undefined,
    },
  },
  methods: {
    closeModal() {
      this.$router.push(`/`)
    },
    goBack() {
      if (this.onBack) this.onBack()
      else this.$router.go(`-1`)
    },
  },
}
</script>

<style>
.session-frame {
  min-width: 100vw;
  min-height: 100vh;
  background: var(--app-fg);
  display: flex;
  justify-content: center;
  align-items: center;
}

.session {
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: 0 0 3px 0 var(--gray-400);
  padding: 2rem;
  position: relative;
  max-width: 540px;
  width: 100%;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
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

.invisible {
  visibility: hidden;
}

@media screen and (max-width: 667px) {
  .session {
    padding: 1rem;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
