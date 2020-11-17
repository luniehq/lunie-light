<template>
  <nuxt-link :to="route" class="li-session" :class="{ card }">
    <div v-if="icon" class="icon">
      <i class="material-icons notranslate circle">{{ icon }}</i>
    </div>
    <div class="row">
      <div class="text">
        <div class="title">{{ title }}</div>
      </div>
      <div class="icon arrow">
        <i class="material-icons notranslate">arrow_forward</i>
      </div>
    </div>
  </nuxt-link>
</template>

<script>
export default {
  name: `LiSession`,
  props: {
    icon: {
      type: String,
      default: ``,
    },
    title: {
      type: String,
      required: true,
    },
    route: {
      type: String,
      default: ``,
    },
    card: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.li-session {
  display: flex;
  padding: 1.5rem;
  margin: 0.5rem 0;
  background: var(--app-fg);
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
  box-shadow: 0 0 1px 0 var(--gray-500);
}

.li-session.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 10rem;
  padding: 1.5rem;
  margin: 0;
}

.li-session.card:first-child {
  background: var(--primary-faded);
}

.li-session.card:first-child:hover {
  background: var(--primary-faded-hover);
}

.arrow {
  transition: all 0.2s ease;
  left: 0;
  position: relative;
}

.card .arrow {
  align-self: flex-end;
}

.li-session:hover {
  cursor: pointer;
  background: var(--app-fg-hover);
}

.li-session:hover .arrow {
  left: -2px;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon i {
  font-size: 1.25rem;
}

.title {
  color: var(--bright);
  font-size: var(--text-lg);
  font-weight: 400;
}

.text {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  padding: 0 1rem;
}

.card .text {
  padding: 0 2rem 0 0;
}

.row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.material-icons.circle {
  border: 2px solid var(--dim);
  color: var(--dim);
  border-radius: 50%;
  padding: 0.5rem;
}

@media screen and (max-width: 667px) {
  .li-session {
    padding: 1rem;
  }
}
</style>
