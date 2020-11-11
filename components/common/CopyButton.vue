<template>
  <button
    v-clipboard:copy="value"
    v-clipboard:success="() => onCopy()"
    class="share-button"
  >
    <span v-if="copySuccess" class="copy-message">Copied!</span>
    <i v-if="copySuccess" class="material-icons check-icon">check</i>
    <i v-else class="material-icons">link</i>
  </button>
</template>

<script>
export default {
  name: 'CopyButton',
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    copySuccess: false,
  }),
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

<style>
.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  outline: none;
  height: 2.25rem;
  font-size: 14px;
  background: transparent;
  color: #7a88b8;
  border: 2px solid rgb(122, 136, 184, 0.1);
  cursor: pointer;
  width: 3rem;
  position: relative;
}

.share-button:hover {
  background-color: var(--bc);
}

.check-icon {
  font-size: 18px;
  color: var(--success);
}

.copy-message {
  position: absolute;
  font-size: 10px;
  top: -1.25rem;
  color: var(--success);
}
</style>
