<template>
  <div v-infinite-scroll="loadMore" infinite-scroll-distance="80">
    <template v-for="group in groupedEvents">
      <div :key="group[0].section">
        <h3>{{ group[0].section }}</h3>
        <TransactionItem
          v-for="item in group"
          :key="item.event.key"
          :transaction="item.event"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { groupBy, orderBy } from 'lodash'
import dayjs from 'dayjs'

const categories = [
  {
    section: 'Today',
    matcher: (event) => {
      // tests if the timestamp has the same day as today
      return dayjs(event.timestamp).isSame(dayjs(), 'day')
    },
  },
  {
    section: 'Yesterday',
    matcher: (event) => {
      return dayjs(event.timestamp).isSame(dayjs().subtract(1, 'days'), 'day')
    },
  },
]

export default {
  name: `EventList`,
  props: {
    events: {
      type: Array,
      required: true,
    },
    moreAvailable: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    showing: 15,
    maxReached: false,
  }),
  computed: {
    showingEvents() {
      return this.events.slice(0, this.showing)
    },
    groupedEvents() {
      return orderBy(
        groupBy(this.categorizedEvents, 'section'),
        (group) => group[0].event.timestamp,
        'desc'
      )
    },
    categorizedEvents() {
      return this.showingEvents.map((event) => {
        // check if the tx is in Today, Yesterday or Last Week
        const dateString =
          ` (` + dayjs(event.timestamp).format('MMMM D, YYYY') + `)`
        const category = categories.find(({ matcher }) => matcher(event))
        if (category) {
          return {
            section: category.section + dateString,
            event,
          }
        }

        // check if tx is in a month this year
        const date = dayjs(event.timestamp)
        const today = dayjs()
        if (date.year() === today.year()) {
          return {
            section: date.format('MMMM D, YYYY'),
            event,
          }
        }

        // tx is in a month another year
        return {
          section: date.format('MMMM D, YYYY'),
          event,
        }
      })
    },
  },
  methods: {
    loadMore() {
      if (!this.maxReached) {
        this.showing += 50

        if (this.showing > this.events.length - 100 && !this.moreAvailable) {
          this.maxReached = true
        }

        // preload next transactions before scroll end and check if last loading loads new records
        if (this.showing > this.events.length - 100 && this.moreAvailable) {
          this.$emit('loadMore')
        }
      }
    },
  },
}
</script>
<style scoped>
h3 {
  margin: 2rem 0 0.5rem 2rem;
  color: var(--txt);
  font-size: 12px;
  font-weight: 400;
}
</style>
