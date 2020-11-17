<template>
  <section id="proposal-timeline" class="container">
    <div class="timeline-container">
      <ul class="timeline">
        <li
          v-for="phase in timeline"
          :key="phase.title"
          class="phase"
          :class="{ done: wasInThePast(phase.time) }"
        >
          <h4>{{ phase.title }}</h4>
          <span class="time">
            <template v-if="phase.time">{{ phase.time | fromNow }}</template>
            <template v-else>?</template>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import dayjs from 'dayjs'
import { fromNow } from '~/common/time'

export default {
  name: `Timeline`,
  filters: {
    fromNow,
  },
  props: {
    timeline: {
      type: Array,
      required: true,
    },
  },
  methods: {
    wasInThePast(time) {
      return dayjs(time).isBefore(Date.now().utc)
    },
  },
}
</script>

<style scoped>
.container {
  padding: 1rem 0 0;
  margin: 3rem 0;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
}

.timeline {
  max-width: 1024px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  width: 100%;
}

.timeline-container {
  padding: 2rem;
  margin: 3rem 0;
  border-top: 2px solid var(--gray-200);
}

.phase {
  font-size: 14px;
  text-align: center;
  text-transform: capitalize;
}

.phase::before {
  display: block;
  content: '';
  font-size: 10px;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--bc);
  border-radius: 50%;
  margin: -2.7rem auto 1rem;
  background: var(--app-bg);
  color: var(--success);
}

.done.phase::before {
  content: '\2713';
  line-height: 12px;
  font-weight: 900;
  border-color: var(--success);
  background: var(--green-100);
}

.time {
  font-size: 12px;
  color: var(--dim);
}
</style>
