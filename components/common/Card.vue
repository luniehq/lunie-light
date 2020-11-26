<template>
  <div class="card">
    <div
      v-if="icon"
      class="icon"
      :class="{ success: success, 'fa-spin': spin }"
    >
      <i
        :style="`background: ${iconColor}`"
        class="material-icons notranslate"
        >{{ icon }}</i
      >
    </div>
    <div class="text">
      <h2 class="title">
        <slot name="title">
          {{ title }}
        </slot>
      </h2>
      <h3 class="subtitle">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </h3>
    </div>
  </div>
</template>

<script>
export default {
  name: `Card`,
  props: {
    title: {
      type: String,
      default: null,
    },
    subtitle: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    spin: {
      type: Boolean,
      default: false,
    },
    success: {
      type: Boolean,
      default: false,
    },
    iconColor: {
      type: String,
      default: `var(--warning)`,
    },
  },
}
</script>

<style scoped>
.card {
  padding: 2rem;
  display: flex;
  align-items: center;
  margin: 1rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

.icon {
  margin-right: 1.5rem;
}

.icon i.material-icons {
  font-size: 2rem;
  color: var(--white);
  background: var(--warning);
  padding: 0.5rem;
  border-radius: 50%;
}

.icon.success i.material-icons {
  background: var(--success);
}

.title {
  font-weight: 600;
  padding-bottom: 0.5rem;
  color: var(--bright);
  font-size: var(--text-lg);
}

.subtitle {
  color: var(--txt);
  font-size: var(--text-sm);
  word-break: break-word;
}

.fa-spin {
  animation: spin 1400ms linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 767px) {
  .card {
    padding: 2rem 1rem;
    margin: 1rem;
  }
}

@media screen and (max-width: 1023px) {
  .card {
    display: block;
    padding: 2rem;
  }

  .icon {
    margin-bottom: 1rem;
  }
}
</style>
