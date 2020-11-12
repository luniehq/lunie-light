<template>
  <div class="card">
    <div v-if="icon" class="card__icon" :class="{ success: success }">
      <i
        :style="`background: ${iconColor}`"
        class="material-icons notranslate"
        >{{ icon }}</i
      >
    </div>
    <div class="card__text">
      <h2 class="card__title">
        <slot name="title">
          {{ title }}
        </slot>
      </h2>
      <h3 class="card__subtitle">
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
  padding: 2rem 3rem;
  display: flex;
  align-items: center;
  margin: 2rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

.card__icon {
  margin-right: 1.5rem;
}

.card__icon i.material-icons {
  font-size: 2rem;
  color: var(--white);
  background: var(--warning);
  padding: 0.5rem;
  border-radius: 50%;
}

.card__icon.success i.material-icons {
  background: var(--success);
}

.card__title {
  font-weight: 500;
  padding-bottom: 1rem;
  color: var(--bright);
  font-size: var(--text-lg);
}

.card__subtitle {
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

  .card__icon {
    margin-bottom: 1rem;
  }
}
</style>
