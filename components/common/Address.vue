<template>
  <div class="copyable-address">
    <div
      v-clipboard:copy="address"
      v-clipboard:success="() => onCopy()"
      class="address"
    >
      <span>{{ address | formatAddress }}</span>
      <div :class="{ active: copySuccess }" class="icon-container">
        <i class="material-icons notranslate success">check</i>
      </div>
    </div>
  </div>
</template>

<script>
import { formatAddress } from '~/common/address'

export default {
  name: `Address`,
  filters: {
    formatAddress,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
    addressType: {
      type: String,
      default: undefined,
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
<style scoped>
.copyable-address {
  font-size: var(--text-sm);
}

.address {
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--link);
}

.copyable-address .address:hover {
  color: var(--link-hover);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container .success {
  opacity: 0;
  transition: opacity 250ms ease;
}

.icon-container.active .success {
  opacity: 1;
}

.copyable-address i {
  font-size: 14px;
  padding-left: 0.25rem;
}

.icon-container i.success {
  color: var(--success);
}
</style>
