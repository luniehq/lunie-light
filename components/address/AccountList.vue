<template>
  <div>
    <ul class="account-list">
      <li
        v-for="account in accounts"
        :key="`${account.sessionType}_${account.name || account.address}`"
      >
        <div class="account">
          <div class="account-info">
            <h3>{{ account.name }}</h3>
            <Address :address="account.address" />
            <span
              v-if="account.sessionType && !isExtension"
              class="session-type"
              >{{ account.sessionType | capitalizeFirstLetter }}</span
            >
          </div>
          <div class="action-container">
            <Button
              v-if="buttonAction"
              class="account-button"
              :value="buttonText"
              color="primary"
              @click.native="buttonAction(account)"
            />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { capitalizeFirstLetter } from '~/common/strings'

export default {
  name: `AccountList`,
  filters: {
    capitalizeFirstLetter,
  },
  props: {
    accounts: {
      type: Array,
      required: true,
    },
    buttonAction: {
      type: Function,
      default: undefined,
    },
    buttonText: {
      type: String,
      default: '',
    },
    isSelectAccount: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    openAccount: undefined,
  }),
  methods: {
    setNetwork(account) {
      this.openAccount = account
    },
  },
}
</script>
<style scoped>
.account-list {
  margin: 1rem 0;
}

.account-list li {
  position: relative;
}

.account {
  display: flex;
  margin: 0.5rem 0;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 2px solid var(--bc-dim);
  width: 100%;
  height: 4.5rem;
  transition: 0.5s;
}

.account h3 {
  color: var(--bright);
  font-weight: 500;
  font-size: 14px;
}

.account-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.account-button {
  padding: 0.25rem 0.5rem;
}

.copyable-address {
  height: auto;
  padding: 0;
}

.action-container {
  display: flex;
  align-items: center;
}

.session-type {
  font-size: 12px;
}
</style>
