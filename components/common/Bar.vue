<template>
  <div v-if="showMessage" class="bar-container">
    <div :class="`bar ${barType}`">
      <div class="left">
        <p>
          <slot />
        </p>
        <Button
          v-if="linkCaption"
          class="button small"
          :value="linkCaption"
          type="button"
          @click.native="goToLink(link)"
        />
      </div>
      <div class="right">
        <i class="material-icons notranslate close-icon" @click="close()"
          >close</i
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: `Bar`,
  props: {
    barType: {
      type: String,
      default: 'primary',
    },
    link: {
      type: String,
      default: '',
    },
    linkCaption: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showMessage: true,
    }
  },
  methods: {
    close() {
      this.showMessage = false
      this.$emit(`close`)
    },
    goToLink(link) {
      // first check if link is internal or external
      if (link && link.startsWith(`http`)) {
        // make safe and independent from API
        window.open(link, '_blank')
      } else if (link) {
        // it is an internal link
        this.$router.push(link)
      }
    },
  },
}
</script>

<style scoped>
.bar-container {
  margin: 0.5rem;
}

.bar {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  background-color: transparent;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: black;
}

.bar.primary {
  background-color: var(--primary);
}

.bar.success {
  background-color: var(--success);
}

.bar.warning {
  background-color: var(--warning);
}

.bar.danger {
  border: 2px solid var(--danger);
  background-color: var(--red-100);
}

.bar.info {
  background-color: var(--info);
}

.bar .link {
  text-decoration: underline;
  color: var(--white);
  cursor: pointer;
}

.bar .button {
  background-color: transparent;
  color: var(--white);
  border-radius: var(--border-radius);
  padding: 0.1rem 0.5rem;
  cursor: pointer;
}

.right {
  display: flex;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.close-icon {
  cursor: pointer;
  font-size: 18px;
  padding-left: 1rem;
}

@media screen and (max-width: 667px) {
  .bar {
    align-items: baseline;
  }

  .left {
    flex-direction: column;
    align-items: baseline;
  }
}
</style>
