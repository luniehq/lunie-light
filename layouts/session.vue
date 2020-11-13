<template>
  <div
    v-focus-last
    class="session-frame lunie-light"
    tabindex="0"
    @keyup.esc="closeModal()"
  >
    <div class="session-outer-container">
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
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-modal);
  width: 100vw;
  height: 100%;
  background: var(--app-fg);
  display: flex;
  justify-content: center;
  align-items: center;
}

.session-frame:focus {
  outline: none;
}

.session-outer-container {
  position: relative;
  padding: 3rem 0;
}

.session-logo {
  height: 2.5rem;
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
}

.session {
  display: flex;
  flex-direction: column;
  background: var(--white);
  max-width: 560px;
  border-radius: var(--border-radius);
  box-shadow: 0 0 3px 0 var(--gray-400);
  padding: 2rem;
  position: relative;
  overflow: auto;
  max-height: 85vh;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
}

.session-header p {
  font-size: 14px;
}

.session-main {
  flex: 1;
}

.session-main p {
  margin-bottom: 1.5rem;
}

.session-title {
  font-size: var(--text-3xl);
  line-height: 42px;
  color: var(--bright);
  font-weight: 500;
  padding: 0.5rem 0 1rem 0;
  text-align: center;
}

.session-image {
  height: 6rem;
  padding-left: 1rem;
  margin: 1rem auto;
}

.session-list {
  padding: 1rem 0;
}

.session-list h3 {
  font-size: var(--text-xl);
  color: var(--bright);
  font-weight: 500;
  padding: 1rem 1rem 0.5rem;
}

.session-paragraph {
  margin-bottom: 1rem;
  padding: 0 1rem;
}

.session-back {
  cursor: pointer;
  display: flex;
  align-items: center;
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
  padding: 1rem 1rem 0;
  font-size: var(--text-xs);
}

.session-logo-mobile {
  display: block;
  height: 2.5rem;
  margin: 1rem 1rem 3.5rem;
}

.field-checkbox-input {
  display: block;
  line-height: 14px;
  font-size: 14px;
}

.field-checkbox-label {
  color: var(--bright);
}

.accounts-header {
  padding: 0 1rem;
}

.session-subtitle {
  font-size: 1rem;
  color: var(--bright);
  font-weight: 400;
  padding: 0.5rem 0 1rem 0;
  text-align: center;
}

.session .material-icons {
  color: var(--txt);
}

.session .material-icons.show-seed {
  color: inherit;
}

.session .material-icons.circle.back {
  background: var(--app-fg);
  color: var(--dim);
  border-radius: 50%;
  padding: 0.25rem;
  cursor: pointer;
  font-size: var(--text-base);
}

.session .material-icons.circle:hover {
  background: var(--app-fg-hover);
}

@media screen and (min-width: 667px) {
  .session {
    width: 100%;
    min-width: 560px;
  }

  .session-logo-mobile {
    display: none;
  }

  .session-paragraph {
    display: none;
  }
}

@media screen and (max-width: 666px) {
  .session {
    height: 100vh;
    max-height: 100vh;
    padding: 1rem;
    max-width: 100%;
  }

  .session-frame {
    max-width: 100%;
  }

  .bottom-indent.reorder {
    flex-direction: column;
    display: flex;
  }

  .bottom-indent.reorder .seed-phrase {
    order: 2;
  }

  .bottom-indent.reorder .field-checkbox {
    order: 1;
  }

  .session-outer-container {
    width: 100%;
  }

  .session-logo {
    display: none;
  }

  .session-title.welcome {
    display: none;
  }

  .form-main .session-footer button {
    width: 100%;
  }

  .form-main > div {
    display: flex;
    flex-direction: column;
    align-items: space-between;
  }

  .session-close-mobile {
    display: block;
    position: absolute;
    right: 1.9rem;
    top: 4.4rem;
  }

  .session-close-mobile i {
    font-size: 1.25rem;
  }

  .session-title {
    padding: 0.5rem 0 1rem;
  }

  .session-main .step--container {
    margin: 0.5rem 0;
  }
}

@media screen and (min-width: 1024px) {
  .session-close .user-box {
    display: none;
  }
}

.invisible {
  visibility: hidden;
}

.icon-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--app-fg);
  color: var(--dim);
  border-radius: 50%;
  padding: 2.5rem;
  position: absolute;
  top: 0.6rem;
  left: 40%;
  z-index: 1;
  width: 4rem;
  height: 4rem;
}

.icon-image {
  width: 2rem;
  height: 2rem;
  transform: scaleX(-1);
  filter: invert(85%) sepia(9%) saturate(18%) hue-rotate(6deg) brightness(85%)
    contrast(87%); /* converts to same than var(--dim) */
}
</style>
